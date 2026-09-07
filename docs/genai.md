# AI-Assisted Engineering Notes

This document records an example of AI-assisted API scaffolding and the engineering review applied to generated code.

## Scenario

Design a REST API for task management. A task contains:
- title
- description
- status
- due_date
- association with a user

The API supports CRUD operations.

## Prompt

_To be added during implementation._

The final prompt should explicitly request architecture boundaries, validation, authentication assumptions, error handling, tests, and edge cases.

## Representative Generated Output

_To be added._

Use a representative sample rather than dumping an entire generated project.

## Validation Performed

Document:
- compilation/build checks
- tests executed
- API contract review
- security review
- validation review
- persistence review
- edge-case analysis

## Corrections and Improvements

Record specific problems discovered in generated code and the corrections made.

Examples to evaluate:
- missing ownership/authorization checks
- incomplete validation
- raw persistence entity exposure
- poor error handling
- insecure password handling
- missing null/date/status edge cases
- insufficient tests

## Engineering Conclusion

Explain which generated suggestions were accepted, rejected, or modified and why.

The goal is critical evaluation rather than blind adoption of generated code.
