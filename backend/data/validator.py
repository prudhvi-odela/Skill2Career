"""
Skill2Career - Data Validation & Quality Profiling Engine
Performs rigorous data profiling, missing-value analysis, leakage detection, outlier inspection,
and schema validation on tabular datasets.
"""

import os
import json
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np


class DataValidator:
    def __init__(self, target_column: Optional[str] = "readiness_score"):
        self.target_column = target_column

    def validate_dataset(
        self,
        df: pd.DataFrame,
        dataset_name: str = "dataset",
        expected_columns: Optional[List[str]] = None,
        save_report: bool = True,
        reports_dir: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive data validation and quality checks on a DataFrame.
        """
        total_rows, total_cols = df.shape
        warnings = []
        errors = []

        # 1. Row count validation
        if total_rows < 10:
            errors.append(f"Insufficient row count: {total_rows} rows (minimum 10 required for training).")
        elif total_rows < 100:
            warnings.append(f"Low row count: {total_rows} rows. Models may have high variance.")

        # 2. Column existence validation
        missing_expected_cols = []
        if expected_columns:
            missing_expected_cols = [col for col in expected_columns if col not in df.columns]
            if missing_expected_cols:
                errors.append(f"Missing required columns from schema: {missing_expected_cols}")

        # 3. Data type identification
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()

        # 4. Missing value analysis
        missing_counts = df.isnull().sum().to_dict()
        missing_percentages = {col: round(float(count / total_rows) * 100.0, 2) for col, count in missing_counts.items() if count > 0}
        
        for col, pct in missing_percentages.items():
            if pct > 40.0:
                warnings.append(f"Column '{col}' has high missing rate: {pct}%. Consider imputation or dropping.")
            if col == self.target_column and pct > 0.0:
                errors.append(f"Target column '{self.target_column}' contains {pct}% missing values. Target cannot have NaNs.")

        # 5. Duplicate row detection
        duplicate_rows = int(df.duplicated().sum())
        duplicate_pct = round((duplicate_rows / total_rows) * 100.0, 2) if total_rows > 0 else 0.0
        if duplicate_rows > 0:
            warnings.append(f"Detected {duplicate_rows} duplicate rows ({duplicate_pct}% of dataset).")

        # 6. Constant / Zero-variance column detection
        constant_cols = []
        for col in df.columns:
            if df[col].nunique(dropna=False) <= 1:
                constant_cols.append(col)
                warnings.append(f"Column '{col}' is constant (zero variance). It provides no predictive signal.")

        # 7. High-cardinality categorical detection
        high_cardinality_cols = []
        for col in categorical_cols:
            n_unique = df[col].nunique()
            if n_unique > 50 or (total_rows > 0 and n_unique / total_rows > 0.6):
                high_cardinality_cols.append({"column": col, "unique_values": n_unique})
                warnings.append(f"Categorical column '{col}' has high cardinality ({n_unique} unique values).")

        # 8. Outlier summary (IQR method on numeric columns)
        outlier_summary = {}
        for col in numeric_cols:
            series = df[col].dropna()
            if len(series) > 4:
                q25, q75 = np.percentile(series, [25, 75])
                iqr = q75 - q25
                lower_bound = q25 - 1.5 * iqr
                upper_bound = q75 + 1.5 * iqr
                outliers = int(((series < lower_bound) | (series > upper_bound)).sum())
                if outliers > 0:
                    outlier_summary[col] = {
                        "outlier_count": outliers,
                        "percentage": round(float(outliers / total_rows) * 100.0, 2),
                        "lower_bound": round(float(lower_bound), 3),
                        "upper_bound": round(float(upper_bound), 3)
                    }

        # 9. Target distribution analysis & potential leakage check
        target_distribution = {}
        potential_leakage_features = []

        if self.target_column and self.target_column in df.columns:
            target_series = df[self.target_column].dropna()
            if np.issubdtype(target_series.dtype, np.number):
                target_distribution = {
                    "mean": round(float(target_series.mean()), 3),
                    "std": round(float(target_series.std()), 3),
                    "min": round(float(target_series.min()), 3),
                    "max": round(float(target_series.max()), 3),
                    "median": round(float(target_series.median()), 3),
                    "skewness": round(float(target_series.skew()), 3) if len(target_series) > 2 else 0.0
                }

                # Value range sanity checks
                if target_series.min() < 0 or target_series.max() > 100:
                    warnings.append(f"Target '{self.target_column}' has values outside expected [0, 100] range: min={target_series.min()}, max={target_series.max()}.")

                # Leakage check: Correlation > 0.98 with target
                for col in numeric_cols:
                    if col != self.target_column:
                        valid_mask = df[col].notnull() & df[self.target_column].notnull()
                        if valid_mask.sum() >= 4:
                            corr = df.loc[valid_mask, col].corr(df.loc[valid_mask, self.target_column])
                            if pd.notnull(corr) and abs(corr) >= 0.985:
                                potential_leakage_features.append({"column": col, "correlation": round(float(corr), 4)})
                                warnings.append(f"High correlation ({round(corr, 4)}) between '{col}' and target '{self.target_column}'. Potential data leakage.")


        is_valid = len(errors) == 0

        quality_report = {
            "dataset_name": dataset_name,
            "status": "PASSED" if is_valid else "FAILED",
            "is_valid": is_valid,
            "rows": total_rows,
            "columns": total_cols,
            "numeric_features": numeric_cols,
            "categorical_features": categorical_cols,
            "missing_values": missing_percentages,
            "duplicates": {"count": duplicate_rows, "percentage": duplicate_pct},
            "constant_features": constant_cols,
            "high_cardinality_features": high_cardinality_cols,
            "outlier_summary": outlier_summary,
            "target_distribution": target_distribution,
            "potential_leakage_features": potential_leakage_features,
            "warnings": warnings,
            "errors": errors
        }

        # Save report if requested
        if save_report:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            rep_dir = reports_dir or os.path.join(base_dir, "reports")
            os.makedirs(rep_dir, exist_ok=True)
            report_path = os.path.join(rep_dir, f"{dataset_name}_quality_report.json")
            with open(report_path, "w") as f:
                json.dump(quality_report, f, indent=2)

        return quality_report


def validate_csv(csv_path: str, target_column: Optional[str] = "readiness_score") -> Dict[str, Any]:
    """Helper to validate a CSV file directly."""
    if not os.path.exists(csv_path):
        return {"status": "FAILED", "is_valid": False, "errors": [f"File not found: {csv_path}"]}
    df = pd.read_csv(csv_path)
    dataset_name = os.path.splitext(os.path.basename(csv_path))[0]
    validator = DataValidator(target_column=target_column)
    return validator.validate_dataset(df, dataset_name=dataset_name)


if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "backend/data/raw/student_profiles_training.csv"
    report = validate_csv(path)
    print(json.dumps(report, indent=2))
