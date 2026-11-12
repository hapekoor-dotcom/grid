# PlayCanvas viewport

Замена 3D-viewport Rig Grid на **PlayCanvas Engine 2.24.0**. Старый Three/R3F-viewport сохранён в коде как исторический fallback и не используется приложением.

## Что готовое

- `pc.AppBase` — приложение, камера, lights, render loop, resize;
- `pc.CameraFrame` — tone mapping, TAA, bloom, **volumetric fog с local spot lights**;
- кластерные **area lights** с `LTC_MAT_1/LTC_MAT_2` LUT из официального area-lights примера;
- `pc.Picker` — выбор объектов;
- GLB-кресла через `ContainerHandler`;
- тёмный ambient без видимого skybox; неоновые пятна от старого env-atlas убраны;
- миграция старых area-объектов: room/stage/seating больше не превращаются все в stage-deck;
- IES-профили из `public/assets/ies` запекаются в canvas-cookies (`playcanvasCookies.ts`) и назначаются spot/area lights;
- для пола/стен подключены normal-карты concrete/wall, под сценой тёмный site-ground;
- ферма — бесплатная GLB-модель Simple Truss (CC BY 3.0), головы — Motorised Spotlight (CC0), оба ассета нормализуются в сцене;
- базовый проект — приложенный пользователем `base-project.json` (38 объектов, 26 приборов, 24 бара);
- кресла — полный `event-chair.glb` из оригинального GRID (NVIDIA SimReady, CC BY 4.0);
- пол/стены — смешанные roughness-карты original GRID (climbing-wall-base + concrete-clean), без normal-карт;
- пол и стены отбрасывают тени, чтобы свет не проходил сквозь них.

## Что добавлено в репозиторий

- `src/components/view3d/PlayCanvasViewport.tsx` — React-обвязка, русские контролы, quality, screenshot/photo;
- `src/components/view3d/playcanvasRuntime.ts` — адаптер `Project` → PlayCanvas Entities, свет, камера, orbit/pan/zoom, выбор;
- `src/data/area-light-luts.json` — LUT для area lights;
- `app` зависит от `playcanvas@2.24.0`.

## Свет

- 4 Focus Flex — `pc.SpotLight` с red beam, shadows, inverse-square falloff;
- 4 UBL12H — **rect area lights**, направлены вверх линзой, с `volumetricScattering`; у бара отдельные линзы (6 ячеек), а не одна светящаяся полоса;
- `CameraFrame.volumetricFog.localSpotLights = true`;
- ACES tone mapping, TAA, bloom, exposure из проекта;
- плотность дыма и анизотропия пробрасываются из `Project.lighting`;
- при выборе `low/medium` и на SwiftShader автоматически снижаются TAA/renderTargetScale/шаги, чтобы вьюпорт оставался интерактивным.

## Камера и контролы

- Orbit: ЛКМ; pan: ПКМ; wheel: zoom;
- пресеты «Перспектива / Сверху / Спереди / Сбоку»;
- двойной клик — фокус на объекте;
- выбор кликом синхронизирован с правым инспектором; выбранный объект обводится wireframe;
- рабочий свет, стены, качество, PNG и фото-панель остались в нашем UI.

## Ограничения

- Геометрия приборов/ферм — упрощённые примитивы, не финальные GDTF-модели.
- IES-файлы пока не подключены как PlayCanvas cookie; текущие light shapes — профильные конусы/area.
- PlayCanvas CameraFrame — сравнительно новый API; визуальный результат нужно проверять на целевом GPU.
- Beam/ASLS **не используются**; это отдельные GPL-приложения.

## Проверка

```sh
cd app
npx tsc --noEmit
npm test
npm run build
npx playwright test
```
