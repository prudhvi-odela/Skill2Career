"""
Skill2Career Practice & Code Lab Schemas
Pydantic schemas for practice problems, test case evaluations, submissions, and code execution.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class TestCase(BaseModel):
    id: str
    input_data: str
    expected_output: str
    is_hidden: bool = False
    explanation: Optional[str] = None


class PracticeProblemListItem(BaseModel):
    id: str
    problem_code: str
    title: str
    difficulty: str  # "Easy", "Medium", "Hard"
    category: str
    supported_languages: List[str] = []
    canonical_skills: List[str] = []
    acceptance_rate: float = 85.0
    is_solved: bool = False


class PracticeProblemDetailResponse(BaseModel):
    id: str
    problem_code: str
    title: str
    difficulty: str
    category: str
    description: str
    constraints: List[str] = []
    starter_code: Dict[str, str] = {}  # language -> starter template
    supported_languages: List[str] = []
    canonical_skills: List[str] = []
    sample_test_cases: List[TestCase] = []
    hints: List[str] = []


class CodeSubmitRequest(BaseModel):
    language: str  # "python", "javascript", "typescript", "c", "cpp", "java"
    code: str = Field(min_length=1, max_length=65536)


class TestCaseResult(BaseModel):
    test_case_id: str
    input_data: str
    expected_output: str
    actual_output: Optional[str] = None
    passed: bool
    is_hidden: bool = False
    error: Optional[str] = None


class CodeExecutionResultResponse(BaseModel):
    attempt_id: str
    problem_id: str
    language: str
    status: str  # "ACCEPTED", "WRONG_ANSWER", "RUNTIME_ERROR", "TIMEOUT", "COMPILATION_ERROR"
    passed_tests_count: int
    total_tests_count: int
    execution_time_ms: float
    memory_used_kb: float
    output: Optional[str] = None
    error_message: Optional[str] = None
    test_results: List[TestCaseResult] = []
    evidence_recorded: bool = False
    evidence_id: Optional[str] = None


class PracticeAttemptHistoryItem(BaseModel):
    id: str
    problem_id: str
    problem_title: str
    language: str
    status: str
    passed_tests_count: int
    total_tests_count: int
    created_at: datetime
