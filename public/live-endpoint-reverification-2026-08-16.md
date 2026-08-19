# Live Apps Script endpoint re-verification — 2026-08-16

The supplied endpoint was opened directly. A request without an action returned JSON `{"status":"error","message":"Invalid Action"}`, proving the deployment is reachable and executing the script.

A GET request with `action=get_notices` returned a JSON array of live notices, including the current admission notice and existing institutional notices. This confirms the deployed endpoint recognizes the expected GET action and that the provided URL is the active read endpoint.

Next verification step: issue a controlled POST probe using the portal's JSON contract and inspect status/body without assuming that a 2xx response means the row was persisted.


## POST probe result

A non-mutating JSON POST probe (`{"type":"__non_mutating_probe__"}`) reached the Apps Script web-app and received the expected initial HTTP 302 redirect. Following the redirect manually while preserving POST produced a final HTTP 405 response with an HTML error body. Therefore the URL is live for GET/read actions, but its deployed doPost/write handler is still unavailable or not exposed by the current deployment. No Admission Enquiry test row was inserted.


## Latest URL recheck

The latest supplied URL returns the same live `get_notices` JSON response. A non-mutating POST probe again receives HTTP 302 followed by a final HTTP 405 when POST is preserved across the redirect. The new deployment therefore has not exposed a working `doPost` handler at this `/exec` URL; no production enquiry row was written.


## Admin screenshot diagnosis

The Admin screenshot shows an existing Google Sheets HTTP 405 error banner while Sheet rows are present. Current network logs show the portal notice, staff-list, and audit-log GET requests returning HTTP 200 with live data. The visible 405 is therefore a write-path failure message, not proof that existing Sheet data was deleted or missing. The Admin module navigation now clears stale global write/fee status messages, and AdminRecords normalizes raw 405 HTML into a concise safe-status message.
