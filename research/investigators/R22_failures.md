# R22 — Failure Analysis

Recurring classes verified by history/tests:
1. pointer death from distributed ownership/stale modal/capture;
2. renderer magic refresh from signature-based invalidation;
3. temporal poisoning from missing RD/post/project reset;
4. project leakage from incomplete destroy/global provider;
5. geometry ordered-uniform binding regression (int array/count → scalar floats fix);
6. post pink/black from RG11B10F intermediate + unbound copy uSource + history; fixed;
7. material see-through from unconditional opacity chunk; fixed conditionally;
8. shader chunk duplicate/redefinition; guards added;
9. camera double-click teleport; removed;
10. localStorage quota/mutation snapshots.
PROPOSAL: invariants, ownership tests, numeric HDR/post identity, resource leak tests, pointer stress.
