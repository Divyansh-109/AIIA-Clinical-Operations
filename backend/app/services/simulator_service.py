from datetime import date, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.study import Study, Site


class SimulatorService:
    @staticmethod
    def simulate_trial_scenario(
        db: Session,
        study_id: UUID,
        additional_sites: int = 0,
        recruitment_rate_multiplier: float = 1.0,
        dropout_rate_pct: float = 5.0,
        protocol_burden_reduction_pct: float = 0.0
    ) -> Dict[str, Any]:
        """
        What-If Trial Simulator (Section 37):
        Computes scenario projections when operational parameters are varied.
        Explicitly displays model assumptions and projected months to completion.
        """
        study = db.query(Study).filter(Study.id == study_id).first()
        if not study:
            return {}

        target = study.target_enrollment or 100
        enrolled = study.actual_enrollment or 0
        remaining_to_enroll = max(1, target - enrolled)

        current_sites_count = len(study.sites) or 1
        # Baseline assumption: ~3.5 participants per site per month
        baseline_rate_per_site_month = 3.5
        current_monthly_rate = current_sites_count * baseline_rate_per_site_month

        baseline_months_remaining = round(remaining_to_enroll / max(0.5, current_monthly_rate), 1)

        # Simulation Model
        simulated_sites = current_sites_count + additional_sites
        # Burden reduction boosts per-site recruitment rate slightly
        burden_boost = 1.0 + (protocol_burden_reduction_pct / 100.0) * 0.2
        effective_rate_per_site = baseline_rate_per_site_month * recruitment_rate_multiplier * burden_boost
        simulated_monthly_rate = simulated_sites * effective_rate_per_site

        # Adjust for dropout: need to enroll extra to compensate
        dropout_multiplier = 1.0 + (dropout_rate_pct / 100.0)
        adjusted_target = int(remaining_to_enroll * dropout_multiplier)

        simulated_months_remaining = round(adjusted_target / max(0.5, simulated_monthly_rate), 1)
        time_saved = round(baseline_months_remaining - simulated_months_remaining, 1)

        projected_date = date.today() + timedelta(days=int(simulated_months_remaining * 30.4))

        narrative = (
            f"Simulation Model: Adding {additional_sites} site(s) increases active clinical network from "
            f"{current_sites_count} to {simulated_sites} facilities. With recruitment efficiency adjusted by "
            f"{recruitment_rate_multiplier}x and protocol burden modified by {protocol_burden_reduction_pct}%, "
            f"projected monthly enrollment rises from {round(current_monthly_rate, 1)} to {round(simulated_monthly_rate, 1)} "
            f"subjects/month, altering completion milestone by {time_saved} months."
        )

        return {
            "study_id": study.id,
            "study_code": study.study_code,
            "baseline_months_to_completion": baseline_months_remaining,
            "simulated_months_to_completion": simulated_months_remaining,
            "time_saved_months": time_saved,
            "projected_total_enrollment": target,
            "projected_completion_date": projected_date,
            "assumptions_narrative": narrative
        }
