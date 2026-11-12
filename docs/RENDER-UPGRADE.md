# Photorealistic rendering upgrade (historical Three.js experiment)

> Актуальный 3D-viewport теперь работает на PlayCanvas Engine, см. [`PLAYCANVAS-VIEWPORT.md`](PLAYCANVAS-VIEWPORT.md). Этот отчёт описывает предыдущий Three.js-этап и оставлен как история.

Дата: 10 ноября 2026. Задача: поднять 3D-визуализацию Rig Grid до кинематографического уровня, не меняя планировку, координаты и габариты оборудования и не ломая функции планировщика.

## Preflight

Прочитан установленный `3dviz-pro-max/SKILL.md`, загружены рабочие references (`lighting-direction-and-scale`, `object-craft`, `object-reasoning`), записи `style-cinematic` и `stage-previsualization-cue-stack`. `host-probe` обнаружил RTX 4060 Laptop, но браузерный ANGLE-контекст в этой среде пошёл через Intel iGPU; Playwright E2E использует SwiftShader. Blender отсутствует, поэтому сцена построена на существующем Three.js-коде без kit-геометрии и без выдачи kit-доказательств за собственный рендер.

## Baseline

- three **0.187.0**, `@react-three/fiber` **9.8.2**, `@react-three/postprocessing` **3.2.2** / postprocessing **6.39.6**.
- WebGL2 через `WebGLRenderer`; `navigator.gpu` есть, но приложение, postprocessing-цепочка, материалы и кастомные GLSL завязаны на WebGL. Миграция на WebGPU не оправдана без переписывания эффектов; WebGL остаётся рабочей базой.
- До задачи: `MeshStandardMaterial`, SpotLight/RectAreaLight, тени первых четырёх head-приборов, Bloom/Vignette в EffectComposer, scene fog, визуальные конусы `BeamCone`/`BarBeams`, без raymarch, SSAO, AgX, quality-градации и фото-режима.
- Baseline на 1600×900 / Intel ANGLE: ~60 FPS при простой сцене. Геометрий 315, текстур 34, программ 17 (замер через debug-контекст).
- Текущий high на 1920×1080, панели скрыты, Intel iGPU: **~32 FPS**, ~31 мс/кадр, 659 вызовов/кадр (включая shadow/SSAO/volumetric passes), 5,29 млн треугольников/кадр, 290 геометрий, 47 текстур, 34 программы. Это не гарантия FPS на другой системе.

## Что изменено

### Материалы и окружение
- Пол и стены: `MeshPhysicalMaterial`, карты нормалей/шероховатости, процедурная цветовая карта бетона/штукатурки, `normalScale`, clearcoat пола, envMapIntensity; стены — матовая штукатурка с картой `wall-painted`.
- Сцена: физический материал верхней плоскости, более светлый нейтральный тон; фермы — металлический PBR с environment reflections; корпуса приборов — тёмный металл; линзы остаются emissive и не заменяют освещение.
- PMREM-окружение построено процедурно из тёмных нейтральных и слабых цветных карт, `scene.environmentIntensity = 0.16`; это reflection/ambient probe, а не «дневной свет» и не фейковая засветка стен.
- Экран: тёмная CanvasTexture, низкий emissive, без пересвета; отдельный frame.

### Свет
- Новый активный пресет **«Кино · красный/синий»**: 4 head-прибора — красный `#ff1d15`, zoom 11°, 0,95; 4 линейных бара — синий `#1f63ff`, 0,9; PAR выключены; haze 0,62; exposure 2,15.
- Heads — SpotLight с decay 2, angle = fieldAngle/2, тени 1024² (2048² на ultra/photo), penumbra из профиля. Бары — RectAreaLight 60 nit base, ширина 0,94 корпуса; линзы и задняя индикаторная полоса — отдельная emissive-геометрия.
- Пресеты «Синяя заливка», «Магента + синий», «Белый фронт», «Чёрный зал» сохранены/обновлены; все состояния используют существующие LightState, цвет, dimmer, pan/tilt/zoom, строб.
- Управление: плотность дыма, анизотропия рассеяния и включение объёмного света добавлены в инспектор «Свет».

### Объёмный свет
- Новый post-effect `VolumetricScatteringEffect` с `EffectAttribute.DEPTH`: для каждого пикселя восстанавливается мировой луч и линейная дистанция по depth texture.
- Для каждого SpotLight аналитически находятся интервалы пересечения луча с конусом; интегрирование идёт только внутри конусов, с HG-фазой (`anisotropy`), плотностью/transmittance и мягким краем `fieldAngle → beamAngle`. Это не финальные прозрачные конусы.
- Линейные бары добавлены как линейные источники с ограниченной направленной долей; высокое качество рисует дым, низкое/среднее — конусный fallback.
- Дистанция луча обрезается depth buffer сцены; корректное взаимное перекрытие объектов вдоль луча света (volumetric shadow maps) не реализовано — ограничение ниже.
- High 20 samples, ultra 48, photo 96; per-light clamp ≤16. Стабильный стратифицированный jitter, без temporal reprojection/denoise.

### Тени, AO и пост
- SSAO (10 samples, resolutionScale 0,55) на high+, реальные SpotLight shadow maps, ContactShadows с пересборкой по изменению layout.
- AgX tone mapping в composer, exposure от проекта, Bloom threshold 0,88, Hue/Saturation +0,12, Brightness/Contrast +0,08, Vignette 0,5, Noise 0,018 как мелкое зерно/антибандинг, MSAA 2/4. Output colorspace sRGB.
- Low/medium используют конусный fallback; high/ultra/photo — raymarch. Качество меняет dpr, samples, SSAO/contact, MSAA, shadow resolution и bloom — не только ярлык.

### Фото-режим
- Кнопка **Фото-рендер** в viewport: 1×/2×/3× канвас, прогресс, отмена, PNG. Временно включает quality `photo`, меняет pixel ratio, ждёт кадры, снимает canvas, восстанавливает качество и DPR.
- Проверенный вывод 2×: **3728 × 2012 px**, время ~3,3 с на Intel iGPU; файл `screenshots/photoreal/photo-2x.png`.
- Это не path tracing и не отдельный offline renderer; это тот же raster/volumetric pipeline с высоким разрешением и samples.

## Профили качества

| Профиль | DPR | Объём | SSAO/contact | MSAA | Тени |
| --- | --- | --- | --- | --- | --- |
| Низкое | 1 | конусный fallback | нет | 0 | нет |
| Среднее | 1–1,2 | конусный fallback | нет | 0 | 2 |
| Высокое | 1 | raymarch, 20 samples | да, 10 samples / 0,55 | 2 | 4 |
| Ультра | 1–1,5 | raymarch, 48 | да | 4 | 4 |
| Фото | 1–2 | raymarch, 96 | да | 4 | 4 |

## Валидация

Снято с реального работающего рендерера, 1920×1080, панели скрыты, одна камера. Before-архив снят на предыдущей версии; новые состояния используют референсный cinema-пресет, поэтому первая сетка не является like-for-like по цвету сцены. Like-for-like — high / medium fallback / haze off:

- [preview-high](screenshots/photoreal/preview-high-1920.png) — raymarch high.
- [medium fallback](screenshots/photoreal/preview-medium-fallback-1920.png) — те же свет и камера, конусный fallback.
- [haze off](screenshots/photoreal/haze-off-1920.png) — объёмные лучи исчезли, остались только реальные источники и поверхности.
- [red only](screenshots/photoreal/red-only-1920.png) и [blue only](screenshots/photoreal/blue-only-1920.png) — проверка вкладов.
- [photo 2×](screenshots/photoreal/photo-2x.png) — высокое разрешение.
- [comparison grid](screenshots/photoreal/comparison-grid.jpg): before-архив, high, fallback, haze off, red only, blue only.
- [same-lighting grid](screenshots/photoreal/same-lighting-grid.jpg): high / fallback / haze off, одинаковые камера и свет.

Пиксельная проверка итогового photo: в области экрана/центра **0%** полностью клипнутых пикселей по критерию min≥250; общий кадр также 0% по этому критерию, при отдельных максимумах 255. В high preview экран не выжигается.

**Важно:** архивный before-кадр использует старый тёплый пресет; после смены на референсный red/blue он не является like-for-like. Like-for-like сравнение — high против medium fallback и haze off при одинаковых свете/камере.

## Тесты и сборка

- `tsc -b` / production build — проходят.
- **36 unit-тестов** (включая профили качества, cinema preset, количество объёмных источников).
- **15 E2E** (включая photo PNG, auto-collapse, segment state); фото-сценарий в SwiftShader может занимать несколько минут.
- Console errors в проверенных сценариях — 0.

## Ограничения

- Нет IES/фотометрии/люменов и калибровки по паспорту; интенсивности — явные визуальные default-значения. Не называю это физически точным.
- Depth-aware occlusion учитывает surface depth камеры; **нет выборки shadow maps внутри объёма**, поэтому луч не затеняется транзитным объектом между светом и точкой рассеяния.
- Нет TAA/temporal reprojection/denoise; high 20 samples и фото 96 с статическим jitter. Тонкие конусы на high могут давать лёгкую ступенчатость; фото лучше.
- Нет SSR/planar reflection: отражения — PBR specular + environment probe, не экранные отражения объектов.
- Нет path tracing и WebGPU-миграции. WebGL fallback сохранён.
- Сегменты баров меняют линзы и их визуальный вклад; вклад в поверхность стены остаётся приближённым прямоугольным/линейным излучателем.
- Photo-режим не является offline-рендером с накоплением; это высокое разрешение текущего pipeline. Прогресс этапный, отмена до снимка.
- UI вне 3D/Свет не переделывался; добавлены только контролы качества/атмосферы, фото и индикатор бара.
- Координаты и габариты оборудования в этой задаче не менялись; изменены материалы, пресеты, яркости, zoom/цвет и визуальные детали.
