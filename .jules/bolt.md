## 2026-05-02 - Pre-aggregate Attendance Filtering
**Learning:** Found an (N 	imes M)$ performance bottleneck where attendance filtering (.filter) was done inside a loop (.map) of users, leading to massive re-iteration of attendance arrays.
**Action:** Always pre-aggregate attendance data into an in-memory Map keyed by userId in a single (M)$ pass. Then map over users using (1)$ lookups. Ensure explicit null checks for IDs when aggregating.
