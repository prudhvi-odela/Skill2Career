"""
Skill2Career - Reusable Preprocessing & Pipeline Builder
Constructs leak-free Scikit-Learn transformers and pipelines.
Transformers are fit strictly on training folds.
"""

from typing import List, Optional
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.base import BaseEstimator


def build_tabular_preprocessor(
    numerical_features: List[str],
    categorical_features: List[str]
) -> ColumnTransformer:
    """
    Creates a scikit-learn ColumnTransformer for numerical standardization
    and categorical one-hot encoding with handle_unknown='ignore'.
    """
    transformers = []
    if numerical_features:
        transformers.append((
            "num",
            StandardScaler(),
            numerical_features
        ))
    if categorical_features:
        transformers.append((
            "cat",
            OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            categorical_features
        ))

    preprocessor = ColumnTransformer(
        transformers=transformers,
        remainder="drop"
    )
    return preprocessor


def build_trajectory_preprocessor() -> StandardScaler:
    """
    StandardScaler for trajectory feature matrices.
    """
    return StandardScaler()


def create_model_pipeline(
    preprocessor: BaseEstimator,
    model: BaseEstimator
) -> Pipeline:
    """
    Combines preprocessor and estimator into an atomic Pipeline object.
    Ensures preprocessor is never fit on test data.
    """
    return Pipeline([
        ("preprocessor", preprocessor),
        ("model", model)
    ])
