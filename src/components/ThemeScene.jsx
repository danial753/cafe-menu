import { memo, useEffect } from 'react';
import { HalloweenScene, HalloweenTop } from './scenes/Halloween.jsx';
import { LoveScene, LoveTop } from './scenes/Love.jsx';
import { RamadanScene, RamadanTop } from './scenes/Ramadan.jsx';
import { YaldaScene, YaldaTop } from './scenes/Yalda.jsx';
import { NowruzScene, NowruzTop } from './scenes/Nowruz.jsx';
import { AutumnScene, AutumnTop } from './scenes/Autumn.jsx';
import { ChristmasScene, ChristmasTop } from './scenes/Christmas.jsx';
import { MotherScene, MotherTop } from './scenes/Mother.jsx';
import { ClassicScene, ClassicTop } from './scenes/Classic.jsx';
import { RubyScene, RubyTop } from './scenes/Ruby.jsx';
import { Birds, Embers, LightShafts, Lightning, Searchlight, ShootingStars, Sleigh } from './scenes/Effects.jsx';

/**
 * صحنه‌ی پس‌زمینه و دکور بالای صفحه برای هر تم مناسبتی.
 * هر دو لایه fixed هستند، pointer-events ندارند و برای صفحه‌خوان‌ها مخفی‌اند.
 */
function ChristmasFx() {
  return (
    <>
      <ShootingStars count={2} />
      <Sleigh />
    </>
  );
}

const SCENES = {
  classic: { Scene: ClassicScene, Top: ClassicTop },
  ruby: { Scene: RubyScene, Top: RubyTop },
  halloween: { Scene: HalloweenScene, Top: HalloweenTop, Fx: Lightning },
  love: { Scene: LoveScene, Top: LoveTop, Fx: Searchlight },
  ramadan: { Scene: RamadanScene, Top: RamadanTop, Fx: ShootingStars },
  yalda: { Scene: YaldaScene, Top: YaldaTop, Fx: Embers },
  nowruz: { Scene: NowruzScene, Top: NowruzTop, Fx: Birds },
  autumn: { Scene: AutumnScene, Top: AutumnTop, Fx: LightShafts },
  christmas: { Scene: ChristmasScene, Top: ChristmasTop, Fx: ChristmasFx },
  mother: { Scene: MotherScene, Top: MotherTop },
};

/** پارالاکس نرم با اسکرول: دورترین لایه‌ها کمتر و نزدیک‌ترها بیشتر جابه‌جا می‌شوند */
function useScrollParallax(active) {
  useEffect(() => {
    if (!active || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const apply = () => {
      raf = 0;
      document.documentElement.style.setProperty('--sy', String(Math.min(window.scrollY || 0, 1600)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [active]);
}

function ThemeScene({ id }) {
  const entry = SCENES[id];
  useScrollParallax(Boolean(entry));
  if (!entry) return null;
  const { Scene, Top, Fx } = entry;
  return (
    <>
      <div id="theme-scene" data-scene={id} aria-hidden="true">
        <Scene />
        {Fx ? <Fx /> : null}
        <div className="atmo" />
      </div>
      {Top ? (
        <div id="theme-top" data-scene={id} aria-hidden="true">
          <Top />
        </div>
      ) : null}
    </>
  );
}

export default memo(ThemeScene);
