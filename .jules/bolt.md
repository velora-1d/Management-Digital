## 2024-05-18 - Recap Aggregation
**Learning:** Using `.filter()` on a large dataset inside a `.map()` loop creates an O(N * M) bottleneck, particularly noticeable in attendance recaps.
**Action:** Pre-aggregate data into a `Map` or lookup object before mapping to achieve O(N + M) complexity.
