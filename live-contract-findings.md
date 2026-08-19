# Live Apps Script contract findings — 2026-08-16

The configured Apps Script GET endpoint responds with raw JSON arrays, not a wrapper object. `action=get_notices` returns objects shaped as `{date, type, content}`.

`action=get_sheet_data&sheet_name=ATTENDANCE` returns a matrix whose header row is `["DATE","ROLL","NAME ","TRADE","UNIT","STATUS"]`. Data rows contain actual attendance values in column six, such as `P` and `A`. The Trade column stores the combined identifier, for example `2026-28ELECTRICIAN` and `2026-28FITTER`, while Unit is a separate column.

This confirms the live backend has attendance status values and combined Session+Trade values. The remaining failure is in the application’s report filtering/mapping path rather than missing data from this live sheet response.
