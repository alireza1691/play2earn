'use client';
import { DEFAULT_TESTNET, routeFor } from "@/lib/deployments";

/**
 * Landing page. Replaces the old Intro/Starter/Carousel/Roadmap/FAQ stack.
 *
 * Everything is styled inline off two CSS variables (--pw-accent and
 * --pw-on-accent set on the wrapper) so nothing here can collide with the
 * Tailwind classes the game screens use. The only global additions this needs
 * are the two font families and the three @keyframes in app/globals.css.
 *
 * The numbers on this page are the constants the contracts run on
 * (back-end/src/Town.sol and Vars.sol): 10,000 lands on a 100x100 grid with
 * x,y from 100 to 199, token id = coordinates concatenated, goods accrue every
 * three hours and double per level up to 40 x level, building cost doubles per
 * level, one worker per land skippable at 1 gold a minute, loot 30 per
 * surviving warrior, army cap 50 per training-camp level (10 with no camp),
 * warrior i needs barracks level i+1, fees 5% on sell/swap/transfer and 10% on
 * withdraw. Update them here when the contracts change.
 */

import { ConnectWallet } from '@thirdweb-dev/react';
import Link from 'next/link';
import PlotwarMark from '@/svg/plotwarMark';
import { type CSSProperties, useEffect, useState } from 'react';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { FaBars, FaDiscord } from 'react-icons/fa6';
import { IoMdDownload } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { RiTelegramFill } from 'react-icons/ri';

/** When the Polygon world opens. The land presale on mainnet is already live. */
const MAINNET_OPEN = Date.parse('2026-10-01T00:00:00Z');

const TESTNET_ROUTE = '/testnet/explore';
const MAINNET_ROUTE = '/explore';

/** In-page sections, and the game routes the old navbar carried. */
const SECTION_LINKS = [
  { label: 'Map', href: '#map' },
  { label: 'Gameplay', href: '#play' },
  { label: 'Economy', href: '#economy' },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'FAQ', href: '#faq' },
];
const APP_LINKS = [
  { label: 'Explore', href: MAINNET_ROUTE },
  { label: 'Dashboard', href: '/dashboard' },
];
const WHITEPAPER = '/Plotwar Whitepaper.pdf';

const PALETTES = {
  /** Plotwar's own mint, the colour the game buttons already use. */
  plotwar: ['#98FBD7', '#06291D'],
  signal: ['#FF4D1A', '#0D0F12'],
  green: ['#2BE07A', '#0B1410'],
  paper: ['#F4F4F1', '#0D0F12'],
  blue: ['#4D7CFF', '#0B1020'],
} as const;

type PaletteName = keyof typeof PALETTES;

function relLum(hex: string) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const l = [0, 2, 4]
    .map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}
function ratio(a: number, hex: string) {
  const b = relLum(hex);
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi + 0.05) / (lo + 0.05);
}

const mono = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

type Props = {
  /** Accent pair: [accent, preferred foreground]. Foreground falls back to whichever of ink/paper contrasts better. */
  palette?: PaletteName | [string, string];
  /** 'a' full-board hero, 'b' split countdown-led hero, 'both' stacks them. */
  hero?: 'both' | 'a' | 'b';
};

export default function PlotwarLanding({ palette = 'plotwar', hero = 'a' }: Props) {
  const [t, setT] = useState({ d: '--', h: '--', m: '--', s: '--' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const pair = Array.isArray(palette) ? palette : PALETTES[palette];
  const accent = pair[0];
  const lum = relLum(accent);
  const onAccent =
    pair[1] && ratio(lum, pair[1]) >= 4.2
      ? pair[1]
      : ratio(lum, '#0D0F12') >= ratio(lum, '#F4F4F1')
        ? '#0D0F12'
        : '#F4F4F1';

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const tick = () => {
      const diff = Math.max(0, MAINNET_OPEN - Date.now());
      setT({
        d: String(Math.floor(diff / 86400000)),
        h: pad(Math.floor(diff / 3600000) % 24),
        m: pad(Math.floor(diff / 60000) % 60),
        s: pad(Math.floor(diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /*
    Which section the rail highlights. The margins shrink the observed area to
    a band across the middle of the viewport, so exactly the section you are
    reading counts as visible; ids are kept in a set because the observer only
    reports the ones that changed.
  */
  useEffect(() => {
    const ids = SECTION_LINKS.map((link) => link.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const inView = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) inView.add(entry.target.id);
          else inView.delete(entry.target.id);
        });
        setActiveSection(ids.find((id) => inView.has(id)) ?? '');
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const mintDays = t.d;
  const mintHours = t.h;
  const mintMinutes = t.m;
  const mintSeconds = t.s;
  const showA = hero !== 'b';
  const showB = hero !== 'a';

  return (
    <div
      /* Clears the fixed header below, which is this page's only navbar. */
      className="pwLanding pt-16 lg:pt-[72px]"
      style={
        {
          '--pw-accent': accent,
          '--pw-on-accent': onAccent,
          width: '100%',
          overflowX: 'hidden',
          background: '#0D0F12',
          color: '#F4F4F1',
        } as CSSProperties
      }
    >
      {/*
        The page's navbar. components/navbar.tsx renders nothing on "/", so
        this one carries the brand, the game routes the old navbar linked to,
        and Connect Wallet. The page's own sections are the left rail below.

        Fixed rather than sticky on purpose — body has overflow hidden, which
        makes it a scroll container that position:sticky cannot stick to.
      */}
      <header className="pwNavBar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="h-16 lg:h-[72px]" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 'none', color: '#F4F4F1' }}>
            <PlotwarMark />
            <div className="pwNavBrand">Plotwar</div>
          </Link>

          {/* Section links live in the left rail below, not here — the bar only carries game routes. */}
          <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '20px', flex: '0 1 auto', minWidth: 0, fontFamily: mono, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {APP_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="pwNavLink">{link.label}</Link>
            ))}
            <a download href={WHITEPAPER} className="pwNavLink" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Whitepaper <IoMdDownload style={{ fontSize: '15px' }} />
            </a>
          </nav>

          <div className="hidden lg:flex" style={{ marginLeft: 'auto', alignItems: 'center', gap: '14px', flex: 'none' }}>
            <div className="hidden xl:flex" style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              <span style={{ width: '7px', height: '7px', background: 'var(--pw-accent)', display: 'block', flex: 'none', animation: 'pw-pulse 2.4s ease-in-out infinite' }}></span>Testnet live
            </div>
            <ConnectWallet
              className="!bg-[#0D0F12]/60 !p-3"
              modalSize="wide"
              theme="dark"
              welcomeScreen={{
                title: 'Plotwar',
                subtitle: 'Decentralized P2E game',
                img: { src: '/plotwarMark.svg', width: 120, height: 120 },
              }}
            />
            <Link href={TESTNET_ROUTE} className="pwNavCta" style={{ flex: 'none' }}>Play free</Link>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="lg:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            style={{ marginLeft: 'auto', flex: 'none', color: '#F4F4F1', fontSize: '22px', padding: '8px' }}
          >
            {mobileMenuOpen ? <IoClose /> : <FaBars />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="pwNavPanel lg:hidden" style={{ borderTop: '1px solid var(--pw-line)', padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: 'calc(100dvh - 4rem)', overflowY: 'auto' }}>
            <ConnectWallet
              className="!bg-[#0D0F12]/60 !p-3 !w-full"
              modalSize="wide"
              theme="dark"
              welcomeScreen={{
                title: 'Plotwar',
                subtitle: 'Decentralized P2E game',
                img: { src: '/plotwarMark.svg', width: 120, height: 120 },
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: mono, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {APP_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="pwNavLink !text-[13px] !text-[#F4F4F1]">{link.label}</Link>
              ))}
              <a download href={WHITEPAPER} onClick={() => setMobileMenuOpen(false)} style={{ color: '#F4F4F1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Whitepaper <IoMdDownload style={{ fontSize: '16px' }} />
              </a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '18px', borderTop: '1px solid rgba(244,244,241,0.12)', fontFamily: mono, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {SECTION_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(244,244,241,0.6)' }}>{link.label}</a>
              ))}
            </div>
            <Link href={TESTNET_ROUTE} onClick={() => setMobileMenuOpen(false)} style={{ background: 'var(--pw-accent)', color: 'var(--pw-on-accent)', fontFamily: mono, fontSize: '13px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '16px 22px', textAlign: 'center' }}>Play free</Link>
          </div>
        )}
      </header>

      {/*
        Section rail, in place of the section links the top bar used to carry.
        Dots only until you hover one (or it is the section you are in), so it
        never fights the page for width. Its own dark backing keeps it legible
        over the light sections it floats above.
      */}
      <nav className="pwRail hidden lg:flex" aria-label="Page sections">
        {SECTION_LINKS.map((link) => {
          const id = link.href.slice(1);
          const isActive = activeSection === id;
          return (
            <a key={link.href} href={link.href} data-active={isActive} aria-current={isActive ? 'true' : undefined}>
              <span
                className="pwRailDot"
                style={{ width: isActive ? '18px' : '8px', background: isActive ? 'var(--pw-accent)' : 'rgba(244,244,241,0.4)' }}
              ></span>
              <span
                className="pwRailLabel"
                style={{ fontFamily: mono, color: isActive ? 'var(--pw-accent)' : 'rgba(244,244,241,0.8)' }}
              >
                {link.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Illustration of the kind of events the battle log shows, not a live feed. */}
      <div style={{ borderBottom: '1px solid rgba(244,244,241,0.12)', background: '#0D0F12', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 'none', fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pw-on-accent)', background: 'var(--pw-accent)', padding: '9px 14px', zIndex: 2 }}>Sample feed</div>
          <div style={{ flex: '1', overflow: 'hidden', whiteSpace: 'nowrap', paddingLeft: '24px' }}>
            <div style={{ display: 'inline-flex', gap: '0', animation: 'pw-ticker 42s linear infinite', fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)', willChange: 'transform' }}>
              <span style={{ paddingRight: '40px' }}>Battle resolved · 142–187 attacker won</span>
              <span style={{ color: 'var(--pw-accent)', paddingRight: '40px' }}>Town hall lvl 4 · 118–153 · 30h</span>
              <span style={{ paddingRight: '40px' }}>Farm claimed · +240 food · 176–101</span>
              <span style={{ paddingRight: '40px' }}>Army in transit · 133–164 → 137–170</span>
              <span style={{ color: 'var(--pw-accent)', paddingRight: '40px' }}>12 knights recruited · 154–199</span>
              <span style={{ paddingRight: '40px' }}>Loot collected · 1,140 goods · 109–172</span>
              <span style={{ paddingRight: '40px' }}>Battle resolved · 142–187 attacker won</span>
              <span style={{ color: 'var(--pw-accent)', paddingRight: '40px' }}>Town hall lvl 4 · 118–153 · 30h</span>
              <span style={{ paddingRight: '40px' }}>Farm claimed · +240 food · 176–101</span>
              <span style={{ paddingRight: '40px' }}>Army in transit · 133–164 → 137–170</span>
              <span style={{ color: 'var(--pw-accent)', paddingRight: '40px' }}>12 knights recruited · 154–199</span>
              <span style={{ paddingRight: '40px' }}>Loot collected · 1,140 goods · 109–172</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid rgba(244,244,241,0.12)', background: '#0D0F12' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 28px', fontFamily: mono, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', color: 'rgba(244,244,241,0.45)', whiteSpace: 'nowrap' }}><span style={{ width: '9px', height: '9px', background: 'var(--pw-accent)', display: 'block', flex: 'none' }}></span>Food <span style={{ color: '#F4F4F1', fontVariantNumeric: 'tabular-nums' }}>24,180</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', color: 'rgba(244,244,241,0.45)', whiteSpace: 'nowrap' }}><span style={{ width: '9px', height: '9px', background: 'rgba(244,244,241,0.6)', display: 'block', flex: 'none' }}></span>Gold <span style={{ color: '#F4F4F1', fontVariantNumeric: 'tabular-nums' }}>11,540</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', color: 'rgba(244,244,241,0.45)', whiteSpace: 'nowrap' }}><span style={{ width: '9px', height: '9px', background: 'rgba(244,244,241,0.3)', display: 'block', flex: 'none' }}></span>PLOT in-game <span style={{ color: '#F4F4F1', fontVariantNumeric: 'tabular-nums' }}>6,902</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 20px', color: 'rgba(244,244,241,0.45)', flex: '1 1 auto', justifyContent: 'flex-end' }}>
            <span style={{ whiteSpace: 'nowrap' }}>Sepolia testnet</span>
            <span style={{ whiteSpace: 'nowrap' }}>Worker <span style={{ color: 'var(--pw-accent)' }}>busy · 2h 14m</span></span>
            <span style={{ whiteSpace: 'nowrap', color: 'rgba(244,244,241,0.35)' }}>Sample land 142–187</span>
          </div>
        </div>
      </div>

      {showA && (
        <section id="home" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: '1200px', height: '750px', flex: 'none', transform: 'rotateX(58deg) rotateZ(45deg) translateY(-40px)', backgroundColor: 'rgba(244,244,241,0.02)', backgroundImage: 'repeating-linear-gradient(to right, rgba(244,244,241,0.13) 0 1px, transparent 1px 30px), repeating-linear-gradient(to bottom, rgba(244,244,241,0.13) 0 1px, transparent 1px 30px)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '150px', top: '210px', width: '120px', height: '90px', background: 'rgba(244,244,241,0.16)' }}></div>
              <div style={{ position: 'absolute', left: '300px', top: '150px', width: '90px', height: '60px', background: 'rgba(244,244,241,0.1)' }}></div>
              <div style={{ position: 'absolute', left: '420px', top: '300px', width: '150px', height: '120px', background: 'rgba(244,244,241,0.14)' }}></div>
              <div style={{ position: 'absolute', left: '630px', top: '210px', width: '90px', height: '90px', background: 'var(--pw-accent)', animation: 'pw-pulse 3s ease-in-out infinite' }}></div>
              <div style={{ position: 'absolute', left: '780px', top: '420px', width: '120px', height: '60px', background: 'rgba(244,244,241,0.12)' }}></div>
              <div style={{ position: 'absolute', left: '240px', top: '510px', width: '90px', height: '90px', background: 'rgba(244,244,241,0.09)' }}></div>
              <div style={{ position: 'absolute', left: '900px', top: '150px', width: '60px', height: '120px', background: 'rgba(244,244,241,0.13)' }}></div>
              <div style={{ position: 'absolute', left: '540px', top: '570px', width: '60px', height: '60px', background: 'var(--pw-accent)' }}></div>
              <div style={{ position: 'absolute', left: '990px', top: '480px', width: '90px', height: '60px', background: 'rgba(244,244,241,0.11)' }}></div>
              <div style={{ position: 'absolute', left: '60px', top: '390px', width: '60px', height: '60px', background: 'rgba(244,244,241,0.1)' }}></div>
            </div>
          </div>
          <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to bottom, rgba(13,15,18,0.55) 0%, rgba(13,15,18,0.86) 55%, #0D0F12 100%)' }}></div>

          <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: 'clamp(72px, 9vw, 140px) 24px clamp(56px, 6vw, 96px)' }}>
            <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '28px' }}>10,000 lands · x,y from 100 to 199</div>
            <h1 style={{ fontSize: 'clamp(52px, 9vw, 136px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.88, textTransform: 'uppercase', margin: '0 0 32px', maxWidth: '15ch', textWrap: 'balance' }}>Nobody hands you land.</h1>
            <p style={{ fontSize: 'clamp(17px, 1.6vw, 22px)', lineHeight: 1.5, color: 'rgba(244,244,241,0.68)', maxWidth: '54ch', margin: '0 0 44px', textWrap: 'pretty' }}>A 100×100 map, 10,000 lands, no expansion. Farms and mines make food and gold on a three-hour tick, gold buys warriors, warriors take your neighbour&apos;s goods. Convert the goods to PLOT and withdraw. Free on Sepolia today, real on Polygon from 1 October.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: 'clamp(48px, 6vw, 80px)' }}>
              <Link href={TESTNET_ROUTE} style={{ background: 'var(--pw-accent)', color: 'var(--pw-on-accent)', fontFamily: mono, fontSize: '13px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '20px 34px' }}>Play free on Sepolia</Link>
              <a href="#play" style={{ border: '1px solid rgba(244,244,241,0.3)', color: '#F4F4F1', fontFamily: mono, fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '20px 34px' }}>How the war works</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'transparent' }}>
              <div style={{ boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px 22px' }}><div style={{ fontSize: 'clamp(30px, 3.4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>10,000</div><div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginTop: '8px' }}>Lands, fixed supply</div></div>
              <div style={{ boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px 22px' }}><div style={{ fontSize: 'clamp(30px, 3.4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--pw-accent)' }}>Free</div><div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginTop: '8px' }}>Sepolia, faucet included</div></div>
              <div style={{ boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px 22px' }}><div style={{ fontSize: 'clamp(30px, 3.4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>6</div><div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginTop: '8px' }}>Warrior types</div></div>
              <div style={{ boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px 22px' }}><div style={{ fontSize: 'clamp(30px, 3.4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>{mintDays}d</div><div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginTop: '8px' }}>Until mainnet</div></div>
            </div>
          </div>
        </section>
      )}

      {showB && (
        <section id={showA ? 'home-b' : 'home'} style={{ background: '#F4F4F1', color: '#0D0F12', borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(64px, 7vw, 104px) 24px', display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px, 5vw, 72px)', alignItems: 'center' }}>
            <div style={{ flex: '1 1 460px', minWidth: '300px' }}>
              <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '24px' }}>Testnet live · Mainnet opens 1 October</div>
              <h2 style={{ fontSize: 'clamp(48px, 7.5vw, 108px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.86, textTransform: 'uppercase', margin: '0 0 28px', textWrap: 'balance' }}>Land is<br />the only<br />supply cap.</h2>
              <p style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', lineHeight: 1.55, color: 'rgba(13,15,18,0.7)', maxWidth: '46ch', margin: '0 0 36px', textWrap: 'pretty' }}>10,000 lands exist and the contract cannot mint an eleven-thousandth. Build the whole kingdom free on Sepolia today. On 1 October the Polygon world opens, and the goods your land produces convert into PLOT you can withdraw.</p>
              <div style={{ display: 'flex', gap: '1px', background: 'rgba(13,15,18,0.16)', border: '1px solid rgba(13,15,18,0.16)', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 88px', background: '#F4F4F1', padding: '18px 20px', textAlign: 'center' }}><div style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{mintDays}</div><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.5)', marginTop: '6px' }}>Days</div></div>
                <div style={{ flex: '1 1 88px', background: '#F4F4F1', padding: '18px 20px', textAlign: 'center' }}><div style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{mintHours}</div><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.5)', marginTop: '6px' }}>Hours</div></div>
                <div style={{ flex: '1 1 88px', background: '#F4F4F1', padding: '18px 20px', textAlign: 'center' }}><div style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{mintMinutes}</div><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.5)', marginTop: '6px' }}>Minutes</div></div>
                <div style={{ flex: '1 1 88px', background: 'var(--pw-accent)', padding: '18px 20px', textAlign: 'center' }}><div style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--pw-on-accent)', fontVariantNumeric: 'tabular-nums' }}>{mintSeconds}</div><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'color-mix(in oklab, var(--pw-on-accent) 65%, transparent)', marginTop: '6px' }}>Seconds</div></div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                <Link href={TESTNET_ROUTE} style={{ background: '#0D0F12', color: '#F4F4F1', fontFamily: mono, fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '20px 34px' }}>Play free on Sepolia</Link>
                <a href="#map" style={{ border: '1px solid rgba(13,15,18,0.28)', color: '#0D0F12', fontFamily: mono, fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '20px 34px' }}>See the board</a>
              </div>
            </div>
            <div style={{ flex: '1 1 420px', minWidth: '300px' }}>
              <div style={{ background: '#0D0F12', padding: 'clamp(28px, 3vw, 44px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px', fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  <span style={{ color: 'var(--pw-accent)' }}>World view · 100 parcels</span>
                  <span style={{ color: 'rgba(244,244,241,0.45)' }}>10,000 lands</span>
                </div>
                <div style={{ height: 'clamp(240px, 26vw, 340px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <div style={{ width: '600px', height: '600px', flex: 'none', transform: 'rotateX(58deg) rotateZ(45deg) scale(0.82)', backgroundColor: 'rgba(244,244,241,0.03)', backgroundImage: 'repeating-linear-gradient(to right, rgba(244,244,241,0.15) 0 1px, transparent 1px 30px), repeating-linear-gradient(to bottom, rgba(244,244,241,0.15) 0 1px, transparent 1px 30px)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '120px', top: '150px', width: '90px', height: '90px', background: 'rgba(244,244,241,0.18)' }}></div>
                    <div style={{ position: 'absolute', left: '270px', top: '90px', width: '60px', height: '60px', background: 'rgba(244,244,241,0.11)' }}></div>
                    <div style={{ position: 'absolute', left: '330px', top: '270px', width: '120px', height: '90px', background: 'rgba(244,244,241,0.14)' }}></div>
                    <div style={{ position: 'absolute', left: '180px', top: '330px', width: '60px', height: '60px', background: 'var(--pw-accent)', animation: 'pw-pulse 3s ease-in-out infinite' }}></div>
                    <div style={{ position: 'absolute', left: '420px', top: '420px', width: '90px', height: '60px', background: 'rgba(244,244,241,0.1)' }}></div>
                    <div style={{ position: 'absolute', left: '90px', top: '450px', width: '60px', height: '90px', background: 'rgba(244,244,241,0.12)' }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px', fontFamily: mono, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '9px', height: '9px', background: 'rgba(244,244,241,0.35)', display: 'block' }}></span>Owned</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '9px', height: '9px', background: 'var(--pw-accent)', display: 'block' }}></span>Yours</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '9px', height: '9px', border: '1px solid rgba(244,244,241,0.3)', display: 'block' }}></span>Unowned</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="map" style={{ padding: 'clamp(80px, 9vw, 132px) 0', borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(40px, 5vw, 64px)' }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '18px' }}>The board</div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94, textTransform: 'uppercase', margin: 0, maxWidth: '22ch', textWrap: 'balance' }}>One map. 10,000 lands. Everything past the edge is sea.</h2>
            </div>
            <p style={{ fontSize: '17px', lineHeight: 1.6, color: 'rgba(244,244,241,0.62)', maxWidth: '40ch', margin: 0, textWrap: 'pretty' }}>Every land is an NFT whose id is just its coordinates written together — 134 and 176 becomes 134176. Browse 100 parcels in world view, zoom into one to click individual lands. Mint price is read live off the contract, first come first served.</p>
          </div>
        </div>

        <div style={{ position: 'relative', height: 'clamp(360px, 46vw, 640px)', overflow: 'hidden', borderTop: '1px solid rgba(244,244,241,0.1)', borderBottom: '1px solid rgba(244,244,241,0.1)' }}>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '1200px', height: '750px', flex: 'none', transform: 'rotateX(56deg) rotateZ(45deg)', backgroundColor: 'rgba(244,244,241,0.025)', backgroundImage: 'repeating-linear-gradient(to right, rgba(244,244,241,0.14) 0 1px, transparent 1px 30px), repeating-linear-gradient(to bottom, rgba(244,244,241,0.14) 0 1px, transparent 1px 30px)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '90px', top: '120px', width: '150px', height: '90px', background: 'rgba(244,244,241,0.17)' }}></div>
              <div style={{ position: 'absolute', left: '270px', top: '60px', width: '90px', height: '120px', background: 'rgba(244,244,241,0.1)' }}></div>
              <div style={{ position: 'absolute', left: '420px', top: '180px', width: '120px', height: '120px', background: 'rgba(244,244,241,0.14)' }}></div>
              <div style={{ position: 'absolute', left: '600px', top: '90px', width: '90px', height: '60px', background: 'rgba(244,244,241,0.11)' }}></div>
              <div style={{ position: 'absolute', left: '720px', top: '210px', width: '150px', height: '90px', background: 'rgba(244,244,241,0.16)' }}></div>
              <div style={{ position: 'absolute', left: '930px', top: '120px', width: '90px', height: '90px', background: 'rgba(244,244,241,0.1)' }}></div>
              <div style={{ position: 'absolute', left: '150px', top: '330px', width: '90px', height: '120px', background: 'rgba(244,244,241,0.13)' }}></div>
              <div style={{ position: 'absolute', left: '330px', top: '390px', width: '120px', height: '90px', background: 'var(--pw-accent)', animation: 'pw-pulse 3.4s ease-in-out infinite' }}></div>
              <div style={{ position: 'absolute', left: '540px', top: '420px', width: '90px', height: '90px', background: 'rgba(244,244,241,0.15)' }}></div>
              <div style={{ position: 'absolute', left: '690px', top: '540px', width: '150px', height: '60px', background: 'rgba(244,244,241,0.11)' }}></div>
              <div style={{ position: 'absolute', left: '900px', top: '390px', width: '60px', height: '120px', background: 'rgba(244,244,241,0.14)' }}></div>
              <div style={{ position: 'absolute', left: '1020px', top: '570px', width: '90px', height: '90px', background: 'rgba(244,244,241,0.09)' }}></div>
              <div style={{ position: 'absolute', left: '60px', top: '570px', width: '120px', height: '60px', background: 'rgba(244,244,241,0.12)' }}></div>
              <div style={{ position: 'absolute', left: '480px', top: '630px', width: '60px', height: '60px', background: 'var(--pw-accent)' }}></div>
              <div style={{ position: 'absolute', left: '810px', top: '60px', width: '60px', height: '60px', background: 'var(--pw-accent)', animation: 'pw-pulse 4s ease-in-out infinite' }}></div>
            </div>
          </div>
          <div style={{ position: 'absolute', inset: '0', background: 'radial-gradient(ellipse at center, transparent 30%, rgba(13,15,18,0.9) 82%)' }}></div>
          <div style={{ position: 'absolute', left: '0', right: '0', top: '0', height: '2px', background: 'linear-gradient(to right, transparent, var(--pw-accent), transparent)', opacity: 0.5, animation: 'pw-scan 9s linear infinite', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', inset: '0', pointerEvents: 'none', fontFamily: mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            <div style={{ position: 'absolute', left: '6%', top: '16%', color: 'rgba(244,244,241,0.45)', borderLeft: '1px solid rgba(244,244,241,0.3)', paddingLeft: '8px' }}>100–100</div>
            <div style={{ position: 'absolute', right: '6%', bottom: '14%', color: 'rgba(244,244,241,0.45)', borderRight: '1px solid rgba(244,244,241,0.3)', paddingRight: '8px', textAlign: 'right' }}>199–199</div>
            <div style={{ position: 'absolute', left: '44%', top: '46%', color: 'var(--pw-accent)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '6px', height: '6px', background: 'var(--pw-accent)', display: 'block' }}></span>142–187 · id 142187</div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: '#0D0F12' }}>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '32px 26px' }}><div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '12px' }}>Supply</div><div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.7)', maxWidth: '30ch' }}>10,000 lands on a 100×100 grid. No expansion exists in the contract.</div></div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '32px 26px' }}><div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '12px' }}>Reach</div><div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.7)', maxWidth: '30ch' }}>You can march on any land. Travel time comes from the straight-line distance, so distance is the real cost.</div></div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '32px 26px' }}><div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '12px' }}>Yield</div><div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.7)', maxWidth: '30ch' }}>Farms and gold mines accrue every three hours and double per level, up to a ceiling of 40 × level.</div></div>
          </div>
        </div>
      </section>

      <section style={{ borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px, 6vw, 88px) 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1px', background: '#0D0F12' }}>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: 'clamp(28px, 3vw, 44px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)', marginBottom: '22px' }}><span style={{ width: '7px', height: '7px', background: 'rgba(244,244,241,0.6)', display: 'block' }}></span>Sepolia testnet · open now</div>
              <div style={{ fontSize: 'clamp(26px, 2.8vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '16px' }}>Play free, risk nothing</div>
              <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.65)', maxWidth: '42ch', textWrap: 'pretty' }}>Sepolia. Lands cost valueless test ETH and the in-game faucet hands out test PLOT. Same contracts, same maths, nothing withdrawable.</div>
              <Link href={TESTNET_ROUTE} style={{ display: 'inline-block', marginTop: '24px', fontFamily: mono, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pw-accent)', borderBottom: '1px solid var(--pw-accent)', paddingBottom: '4px' }}>Enter the testnet →</Link>
            </div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: 'clamp(28px, 3vw, 44px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '22px' }}><span style={{ width: '7px', height: '7px', background: 'var(--pw-accent)', display: 'block', animation: 'pw-pulse 3s ease-in-out infinite' }}></span>Polygon mainnet · land presale live</div>
              <div style={{ fontSize: 'clamp(26px, 2.8vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '16px' }}>Own land, withdraw PLOT</div>
              <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.65)', maxWidth: '42ch', textWrap: 'pretty' }}>Lands are minting on Polygon now, ahead of the world opening on 1 October. Separate contracts, separate lands, separate armies — a testnet kingdom does not carry over.</div>
              <Link href={MAINNET_ROUTE} style={{ display: 'inline-block', marginTop: '24px', fontFamily: mono, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pw-accent)', borderBottom: '1px solid var(--pw-accent)', paddingBottom: '4px' }}>Mainnet land presale →</Link>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px clamp(56px, 6vw, 88px)' }}>
        <div style={{ border: '1px solid rgba(244,244,241,0.14)', padding: 'clamp(22px, 2.4vw, 30px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: '#0D0F12' }}>
          <div style={{ boxShadow: '0 0 0 1px rgba(244,244,241,0.1)', padding: '18px 22px' }}>
            <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '14px' }}>Land 142–187</div>
            <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Town hall lvl 4</div>
          </div>
          <div style={{ boxShadow: '0 0 0 1px rgba(244,244,241,0.1)', padding: '18px 22px' }}>
            <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '14px' }}>Farm · fill vs ceiling</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ flex: '1', height: '8px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '72%', height: '8px', background: 'var(--pw-accent)' }}></div></div><span style={{ fontFamily: mono, fontSize: '12px', color: 'rgba(244,244,241,0.7)' }}>72</span></div>
          </div>
          <div style={{ boxShadow: '0 0 0 1px rgba(244,244,241,0.1)', padding: '18px 22px' }}>
            <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '14px' }}>Standing army · cap 100</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ flex: '1', height: '8px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '44%', height: '8px', background: 'rgba(244,244,241,0.6)' }}></div></div><span style={{ fontFamily: mono, fontSize: '12px', color: 'rgba(244,244,241,0.7)' }}>44</span></div>
          </div>
          <div style={{ boxShadow: '0 0 0 1px rgba(244,244,241,0.1)', padding: '18px 22px' }}>
            <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '14px' }}>Worker · skip cost 134g</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ flex: '1', height: '8px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '21%', height: '8px', background: 'var(--pw-accent)', animation: 'pw-pulse 2.2s ease-in-out infinite' }}></div></div><span style={{ fontFamily: mono, fontSize: '12px', color: 'var(--pw-accent)' }}>busy</span></div>
          </div>
        </div>
        <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.32)', paddingTop: '12px' }}>Sample land readout · one worker per land, so nothing else builds until it frees up</div>
      </div>

      <section id="play" style={{ padding: 'clamp(80px, 9vw, 132px) 0', background: '#F4F4F1', color: '#0D0F12' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '18px' }}>How it plays</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94, textTransform: 'uppercase', margin: '0 0 clamp(44px, 5vw, 72px)', maxWidth: '20ch' }}>Claim. Build. Attack. Earn.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: '#F4F4F1' }}>
            <div style={{ background: '#F4F4F1', boxShadow: '0 0 0 1px rgba(13,15,18,0.18)', padding: '40px 28px 44px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <svg width="26" height="26" viewBox="0 0 100 100" style={{ display: 'block' }}><g transform="rotate(45 50 50)"><rect x="21" y="21" width="26" height="26" fill="var(--pw-accent)"></rect><rect x="53" y="21" width="26" height="26" fill="rgba(13,15,18,0.25)"></rect><rect x="21" y="53" width="26" height="26" fill="rgba(13,15,18,0.25)"></rect><rect x="53" y="53" width="26" height="26" fill="rgba(13,15,18,0.25)"></rect></g></svg>
                <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(13,15,18,0.45)' }}>01</div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.025em', textTransform: 'uppercase', marginBottom: '14px' }}>Claim</div>
              <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(13,15,18,0.68)', maxWidth: '28ch', textWrap: 'pretty' }}>Buy one square of the fixed map. It mints as an NFT and becomes the anchor for your town hall, farms, mines, barracks and army.</div>
              <div style={{ display: 'flex', gap: '18px', marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(13,15,18,0.18)', fontFamily: mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.5)' }}><span>Live mint price</span><span>Supply 10,000</span></div>
            </div>
            <div style={{ background: '#F4F4F1', boxShadow: '0 0 0 1px rgba(13,15,18,0.18)', padding: '40px 28px 44px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}><div style={{ width: '7px', height: '12px', background: 'rgba(13,15,18,0.25)' }}></div><div style={{ width: '7px', height: '20px', background: 'var(--pw-accent)' }}></div><div style={{ width: '7px', height: '26px', background: 'rgba(13,15,18,0.25)' }}></div></div>
                <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(13,15,18,0.45)' }}>02</div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.025em', textTransform: 'uppercase', marginBottom: '14px' }}>Build</div>
              <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(13,15,18,0.68)', maxWidth: '28ch', textWrap: 'pretty' }}>Town hall, farms, gold mines, barracks, walls, training camp. The town hall gates every other level, and one worker means one job at a time.</div>
              <div style={{ display: 'flex', gap: '18px', marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(13,15,18,0.18)', fontFamily: mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.5)' }}><span>Cost ×2 per level</span><span>Skip: 1 gold / minute</span></div>
            </div>
            <div style={{ background: '#F4F4F1', boxShadow: '0 0 0 1px rgba(13,15,18,0.18)', padding: '40px 28px 44px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <svg width="26" height="26" viewBox="0 0 100 100" style={{ display: 'block' }}><polygon points="-42,0 -13,-9.5 13,-9.5 42,0 13,9.5 -13,9.5" fill="var(--pw-accent)" transform="translate(50 50) rotate(45)"></polygon><polygon points="-42,0 -13,-9.5 13,-9.5 42,0 13,9.5 -13,9.5" fill="rgba(13,15,18,0.25)" transform="translate(50 50) rotate(-45)"></polygon></svg>
                <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(13,15,18,0.45)' }}>03</div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.025em', textTransform: 'uppercase', marginBottom: '14px' }}>Attack</div>
              <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(13,15,18,0.68)', maxWidth: '28ch', textWrap: 'pretty' }}>Dispatch, travel, resolve, return, collect — five actions over real hours. Win and your survivors carry the defender&apos;s goods home.</div>
              <div style={{ display: 'flex', gap: '18px', marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(13,15,18,0.18)', fontFamily: mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.5)' }}><span>Loot 30 / survivor</span><span>Walls raise defence</span></div>
            </div>
            <div style={{ background: '#F4F4F1', boxShadow: '0 0 0 1px rgba(13,15,18,0.18)', padding: '40px 28px 44px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '4px' }}><div style={{ width: '12px', height: '12px', background: 'rgba(13,15,18,0.25)' }}></div><div style={{ width: '12px', height: '12px', background: 'rgba(13,15,18,0.25)' }}></div><div style={{ width: '12px', height: '12px', background: 'var(--pw-accent)' }}></div></div>
                <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(13,15,18,0.45)' }}>04</div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.025em', textTransform: 'uppercase', marginBottom: '14px' }}>Earn</div>
              <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(13,15,18,0.68)', maxWidth: '28ch', textWrap: 'pretty' }}>Sell food and gold for in-game PLOT, then withdraw it to your wallet. Every fee is a burn, not revenue.</div>
              <div style={{ display: 'flex', gap: '18px', marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(13,15,18,0.18)', fontFamily: mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.5)' }}><span>Sell 5% · withdraw 10%</span><span>Value on mainnet</span></div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(80px, 9vw, 132px) 0', background: '#0D0F12', borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '18px' }}>Combat</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94, textTransform: 'uppercase', margin: '0 0 clamp(40px, 5vw, 64px)', maxWidth: '20ch', textWrap: 'balance' }}>A battle is two totals compared</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', background: '#0D0F12', marginBottom: '24px' }}>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '22px' }}><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--pw-accent)', marginBottom: '12px' }}>01</div><div style={{ fontSize: '17px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '8px' }}>Dispatch</div><div style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(244,244,241,0.55)' }}>Pick the target and the roster. Food is spent, and those troops leave home defence immediately.</div></div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '22px' }}><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--pw-accent)', marginBottom: '12px' }}>02</div><div style={{ fontSize: '17px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '8px' }}>Travel</div><div style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(244,244,241,0.55)' }}>Real minutes, set by distance. Both players watch it move, and there is no recall once it is marching.</div></div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '22px' }}><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--pw-accent)', marginBottom: '12px' }}>03</div><div style={{ fontSize: '17px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '8px' }}>Resolve</div><div style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(244,244,241,0.55)' }}>You trigger the battle. The defender&apos;s standing army fights automatically.</div></div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '22px' }}><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--pw-accent)', marginBottom: '12px' }}>04</div><div style={{ fontSize: '17px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '8px' }}>Return</div><div style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(244,244,241,0.55)' }}>Survivors walk back the same distance, carrying the loot with them.</div></div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '22px' }}><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', color: 'var(--pw-accent)', marginBottom: '12px' }}>05</div><div style={{ fontSize: '17px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '8px' }}>Collect</div><div style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(244,244,241,0.55)' }}>One last action folds troops and loot back in. Until you sign it, none of it is home.</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: '#0D0F12', marginBottom: '24px' }}>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: 'clamp(26px, 3vw, 38px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '26px', fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                <span style={{ color: 'var(--pw-accent)' }}>Attacker · 142–187</span><span style={{ color: 'rgba(244,244,241,0.4)' }}>Resolved</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div><div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)', marginBottom: '8px' }}><span>Attack power</span><span style={{ color: '#F4F4F1' }}>18,400</span></div><div style={{ height: '10px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '82%', height: '10px', background: 'var(--pw-accent)' }}></div></div></div>
                <div><div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)', marginBottom: '8px' }}><span>Hit points</span><span style={{ color: '#F4F4F1' }}>21,000</span></div><div style={{ height: '10px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '54%', height: '10px', background: 'var(--pw-accent)' }}></div></div></div>
                <div><div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)', marginBottom: '8px' }}><span>Carry capacity</span><span style={{ color: '#F4F4F1' }}>30 / survivor</span></div><div style={{ height: '10px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '18%', height: '10px', background: 'rgba(244,244,241,0.4)' }}></div></div></div>
              </div>
              <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid rgba(244,244,241,0.14)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.025em', textTransform: 'uppercase', color: 'var(--pw-accent)' }}>Survivors 68% · loot taken</div>
            </div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: 'clamp(26px, 3vw, 38px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '26px', fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                <span style={{ color: 'rgba(244,244,241,0.65)' }}>Defender · 168–104</span><span style={{ color: 'rgba(244,244,241,0.4)' }}>Fell</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div><div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)', marginBottom: '8px' }}><span>Defence power</span><span style={{ color: '#F4F4F1' }}>12,900</span></div><div style={{ height: '10px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '60%', height: '10px', background: 'rgba(244,244,241,0.6)' }}></div></div></div>
                <div><div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)', marginBottom: '8px' }}><span>Hit points</span><span style={{ color: '#F4F4F1' }}>15,400</span></div><div style={{ height: '10px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '21%', height: '10px', background: 'rgba(244,244,241,0.6)' }}></div></div></div>
                <div><div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)', marginBottom: '8px' }}><span>Walls lvl 3</span><span style={{ color: '#F4F4F1' }}>+15% defence</span></div><div style={{ height: '10px', background: 'rgba(244,244,241,0.12)' }}><div style={{ width: '12%', height: '10px', background: 'rgba(244,244,241,0.4)' }}></div></div></div>
              </div>
              <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid rgba(244,244,241,0.14)', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.025em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.5)' }}>Survivors 12% · goods lost</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: '#0D0F12' }}>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px' }}>
              <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '16px' }}>Town hall</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div></div>
              <div style={{ fontSize: '15px', lineHeight: 1.5, color: 'rgba(244,244,241,0.6)' }}>Lvl 4 · gates every other build</div>
            </div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px' }}>
              <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '16px' }}>Farm</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div></div>
              <div style={{ fontSize: '15px', lineHeight: 1.5, color: 'rgba(244,244,241,0.6)' }}>Lvl 2 · 4 per land max</div>
            </div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px' }}>
              <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '16px' }}>Barracks</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div></div>
              <div style={{ fontSize: '15px', lineHeight: 1.5, color: 'rgba(244,244,241,0.6)' }}>Lvl 4 · archer unlocked</div>
            </div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px' }}>
              <div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '16px' }}>Training camp</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}><div style={{ flex: '1', height: '6px', background: 'var(--pw-accent)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div><div style={{ flex: '1', height: '6px', background: 'rgba(244,244,241,0.15)' }}></div></div>
              <div style={{ fontSize: '15px', lineHeight: 1.5, color: 'rgba(244,244,241,0.6)' }}>Lvl 2 · army cap 100</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(80px, 9vw, 132px) 0', background: '#F4F4F1', color: '#0D0F12', borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(36px, 4vw, 56px)' }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '18px' }}>Standings</div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94, textTransform: 'uppercase', margin: 0, maxWidth: '20ch' }}>How the board reads</h2>
            </div>
            <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.5)', textAlign: 'right', lineHeight: 1.8 }}>Illustration, not live data<br />Mainnet starts empty on 1 October</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr) 44px 44px 62px', gap: '10px 8px', padding: '0 0 12px', fontFamily: mono, fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(13,15,18,0.45)', borderBottom: '1px solid rgba(13,15,18,0.2)' }}>
              <div>Rank</div><div>Commander</div><div style={{ textAlign: 'right' }}>Lands</div><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Won</div><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Gold/day</div>
            </div>
            {[
              { rank: '01', name: 'Commander 01', lands: '142', won: '311', gold: '9,840', lead: true },
              { rank: '02', name: 'Commander 02', lands: '118', won: '276', gold: '8,120', lead: false },
              { rank: '03', name: 'Commander 03', lands: '97', won: '240', gold: '7,455', lead: false },
              { rank: '04', name: 'Commander 04', lands: '84', won: '198', gold: '6,930', lead: false },
            ].map((row) => (
              <div key={row.rank} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr) 44px 44px 62px', gap: '10px 8px', padding: '20px 0', borderBottom: '1px solid rgba(13,15,18,0.14)', alignItems: 'center' }}>
                <div style={{ fontFamily: mono, fontSize: 'clamp(12px, 2.8vw, 15px)', color: row.lead ? 'var(--pw-accent)' : 'rgba(13,15,18,0.4)' }}>{row.rank}</div>
                <div style={{ fontSize: 'clamp(15px, 3.6vw, 19px)', fontWeight: 700, letterSpacing: '-0.02em', minWidth: '0', overflowWrap: 'anywhere' }}>{row.name}</div>
                <div style={{ fontFamily: mono, fontSize: 'clamp(12px, 2.8vw, 15px)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.lands}</div>
                <div style={{ fontFamily: mono, fontSize: 'clamp(12px, 2.8vw, 15px)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.won}</div>
                <div style={{ fontFamily: mono, fontSize: 'clamp(12px, 2.8vw, 15px)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.gold}</div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr) 44px 44px 62px', gap: '10px 8px', padding: '20px 0', borderBottom: '1px solid rgba(13,15,18,0.2)', alignItems: 'center', background: 'rgba(13,15,18,0.04)' }}>
              <div style={{ fontFamily: mono, fontSize: 'clamp(12px, 2.8vw, 15px)', color: 'rgba(13,15,18,0.4)' }}>—</div><div style={{ fontSize: 'clamp(15px, 3.6vw, 19px)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--pw-accent)', minWidth: '0' }}>You, unranked</div><div style={{ fontFamily: mono, fontSize: 'clamp(12px, 2.8vw, 15px)', textAlign: 'right' }}>0</div><div style={{ fontFamily: mono, fontSize: 'clamp(12px, 2.8vw, 15px)', textAlign: 'right' }}>0</div><div style={{ fontFamily: mono, fontSize: 'clamp(12px, 2.8vw, 15px)', textAlign: 'right' }}>0</div>
            </div>
          </div>
        </div>
      </section>

      <section id="economy" style={{ padding: 'clamp(80px, 9vw, 132px) 0', borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px, 5vw, 80px)' }}>
          <div style={{ flex: '1 1 420px', minWidth: '300px' }}>
            <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '18px' }}>Economy</div>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94, textTransform: 'uppercase', margin: '0 0 28px', maxWidth: '18ch', textWrap: 'balance' }}>Goods in, PLOT out</h2>
            <p style={{ fontSize: '17px', lineHeight: 1.6, color: 'rgba(244,244,241,0.65)', maxWidth: '46ch', margin: '0 0 40px', textWrap: 'pretty' }}>Two goods, food and gold, accrue on your land every three hours. Both start pegged at 1 PLOT and only float once the world holds 50,000 goods. Every conversion fee is burned, so the supply only shrinks.</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '20px', padding: '20px 0', borderTop: '1px solid rgba(244,244,241,0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><span style={{ width: '12px', height: '12px', background: 'var(--pw-accent)', display: 'block', flex: 'none' }}></span><span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>Food</span></div>
                <div style={{ fontFamily: mono, fontSize: '13px', color: 'rgba(244,244,241,0.55)', textAlign: 'right' }}>Farms · pays upkeep &amp; marches</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '20px', padding: '20px 0', borderTop: '1px solid rgba(244,244,241,0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><span style={{ width: '12px', height: '12px', background: 'rgba(244,244,241,0.6)', display: 'block', flex: 'none' }}></span><span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>Gold</span></div>
                <div style={{ fontFamily: mono, fontSize: '13px', color: 'rgba(244,244,241,0.55)', textAlign: 'right' }}>Mines · buys warriors &amp; skips</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '20px', padding: '20px 0', borderTop: '1px solid rgba(244,244,241,0.14)', borderBottom: '1px solid rgba(244,244,241,0.14)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><span style={{ width: '12px', height: '12px', background: 'rgba(244,244,241,0.3)', display: 'block', flex: 'none' }}></span><span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>PLOT</span></div>
                <div style={{ fontFamily: mono, fontSize: '13px', color: 'rgba(244,244,241,0.55)', textAlign: 'right' }}>In-game balance → wallet</div>
              </div>
            </div>
          </div>
          <div style={{ flex: '1 1 380px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(244,244,241,0.14)', border: '1px solid rgba(244,244,241,0.14)' }}>
            <div style={{ background: '#0D0F12', padding: '32px' }}>
              <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginBottom: '20px' }}>Fees · all burned</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontFamily: mono, fontSize: '12px', letterSpacing: '0.06em', color: 'rgba(244,244,241,0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Deposit PLOT in-game</span><span style={{ color: '#F4F4F1' }}>free</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Buy food or gold</span><span style={{ color: '#F4F4F1' }}>free</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Sell goods</span><span style={{ color: 'var(--pw-accent)' }}>5%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Swap food ↔ gold</span><span style={{ color: 'var(--pw-accent)' }}>5%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Transfer between lands</span><span style={{ color: 'var(--pw-accent)' }}>5%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Withdraw to wallet</span><span style={{ color: 'var(--pw-accent)' }}>10%</span></div>
              </div>
            </div>
            <div style={{ background: '#0D0F12', padding: '32px' }}>
              <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginBottom: '14px' }}>Deflation</div>
              <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.7)', textWrap: 'pretty' }}>Four of the six conversions lose value, and what they lose is burned rather than banked. Every screen shows you the amount out before you sign.</div>
            </div>
            <div style={{ background: '#0D0F12', padding: '32px' }}>
              <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginBottom: '14px' }}>Chain</div>
              <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.7)', textWrap: 'pretty' }}>Sepolia testnet and Polygon mainnet run side by side and share no state. The network you are standing in is always shown in the header.</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(80px, 9vw, 132px) 0', borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'clamp(36px, 4vw, 56px)' }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '18px' }}>Roster</div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94, textTransform: 'uppercase', margin: 0, maxWidth: '22ch', textWrap: 'balance' }}>Six warriors, unlocked in order</h2>
            </div>
            <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', textAlign: 'right', lineHeight: 1.8, maxWidth: '30ch' }}>Attack only counts when you march.<br />Defence only when you are attacked.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr) 38px 38px 38px 38px 38px', gap: '10px 8px', padding: '0 0 12px', fontFamily: mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', borderBottom: '1px solid rgba(244,244,241,0.2)' }}>
              <div>#</div><div>Type</div><div style={{ textAlign: 'right' }}>Atk</div><div style={{ textAlign: 'right' }}>Def</div><div style={{ textAlign: 'right' }}>HP</div><div style={{ textAlign: 'right' }}>Gold</div><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Brk</div>
            </div>
            {/* Straight out of Vars.sol: index, name, attack, defence, hp, gold price, required barracks level. */}
            {[
              { i: '0', name: 'Maceman', atk: 45, def: 30, hp: 70, gold: 7, brk: 1 },
              { i: '1', name: 'Spearman', atk: 20, def: 60, hp: 70, gold: 8, brk: 2 },
              { i: '2', name: 'Swordsman', atk: 60, def: 70, hp: 90, gold: 15, brk: 3 },
              { i: '3', name: 'Archer', atk: 50, def: 50, hp: 70, gold: 10, brk: 4 },
              { i: '4', name: 'Shieldman', atk: 45, def: 80, hp: 110, gold: 22, brk: 5 },
              { i: '5', name: 'Knight', atk: 90, def: 60, hp: 100, gold: 30, brk: 6 },
            ].map((w, index, all) => (
              <div key={w.i} style={{ display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr) 38px 38px 38px 38px 38px', gap: '10px 8px', padding: '16px 0', borderBottom: `1px solid rgba(244,244,241,${index === all.length - 1 ? '0.2' : '0.12'})`, alignItems: 'center' }}>
                <div style={{ fontFamily: mono, fontSize: 'clamp(11px, 2.6vw, 13px)', color: 'rgba(244,244,241,0.4)' }}>{w.i}</div>
                <div style={{ fontSize: 'clamp(15px, 3.4vw, 18px)', fontWeight: 700, letterSpacing: '-0.02em', minWidth: '0' }}>{w.name}</div>
                <div style={{ fontFamily: mono, fontSize: 'clamp(11px, 2.6vw, 14px)', textAlign: 'right', color: 'var(--pw-accent)', fontVariantNumeric: 'tabular-nums' }}>{w.atk}</div>
                <div style={{ fontFamily: mono, fontSize: 'clamp(11px, 2.6vw, 14px)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{w.def}</div>
                <div style={{ fontFamily: mono, fontSize: 'clamp(11px, 2.6vw, 14px)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{w.hp}</div>
                <div style={{ fontFamily: mono, fontSize: 'clamp(11px, 2.6vw, 14px)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{w.gold}</div>
                <div style={{ fontFamily: mono, fontSize: 'clamp(11px, 2.6vw, 14px)', textAlign: 'right', color: 'rgba(244,244,241,0.45)', fontVariantNumeric: 'tabular-nums' }}>{w.brk}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: '#0D0F12', marginTop: '32px' }}>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px' }}><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '12px' }}>Unlock</div><div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.68)' }}>Each type needs a barracks at its own level. Your roster tells everyone how far you have got.</div></div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px' }}><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '12px' }}>Capacity</div><div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.68)' }}>50 warriors per training camp level. With no camp a land holds 10 — recruiting past the cap fails.</div></div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '26px' }}><div style={{ fontFamily: mono, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.4)', marginBottom: '12px' }}>Upkeep</div><div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.68)' }}>Gold buys the warrior and food pays for it at recruitment — 3 a head, double for a knight. A big army you cannot feed is a liability.</div></div>
          </div>
        </div>
      </section>

      <section id="roadmap" style={{ padding: 'clamp(80px, 9vw, 132px) 0', borderBottom: '1px solid rgba(244,244,241,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '18px' }}>Roadmap</div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94, textTransform: 'uppercase', margin: '0 0 clamp(44px, 5vw, 72px)', maxWidth: '20ch' }}>From free testnet to sealed map</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: '#0D0F12' }}>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '34px 26px 40px 26px' }}>
              <div style={{ height: '3px', background: 'var(--pw-accent)', marginBottom: '24px', width: '100%' }}></div>
              <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '14px' }}>Now · Testnet</div>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Free play &amp; presale</div>
              <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(244,244,241,0.6)', maxWidth: '26ch' }}>The whole loop — mint, build, recruit, march, convert — live on Sepolia at no cost, while mainnet lands presell on Polygon.</div>
            </div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '34px 26px 40px 26px' }}>
              <div style={{ height: '3px', background: 'rgba(244,244,241,0.25)', marginBottom: '24px' }}></div>
              <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginBottom: '14px' }}>1 Oct 2026</div>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Mainnet opens</div>
              <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(244,244,241,0.6)', maxWidth: '26ch' }}>The Polygon world opens. 10,000 lands, real ownership, withdrawable PLOT.</div>
            </div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '34px 26px 40px 26px' }}>
              <div style={{ height: '3px', background: 'rgba(244,244,241,0.25)', marginBottom: '24px' }}></div>
              <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginBottom: '14px' }}>Q1 2027</div>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Floating prices</div>
              <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(244,244,241,0.6)', maxWidth: '26ch' }}>Goods prices float off the 1:1 peg once the world holds 50,000 goods. Burn rate becomes visible on-chain.</div>
            </div>
            <div style={{ background: '#0D0F12', boxShadow: '0 0 0 1px rgba(244,244,241,0.14)', padding: '34px 26px 40px 26px' }}>
              <div style={{ height: '3px', background: 'rgba(244,244,241,0.25)', marginBottom: '24px' }}></div>
              <div style={{ fontFamily: mono, fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.45)', marginBottom: '14px' }}>2027</div>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>Heroes &amp; season 1</div>
              <div style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(244,244,241,0.6)', maxWidth: '26ch' }}>Heroes you mint and attach to an army, deeper barracks tiers, and the first map-wide war across all 10,000 lands.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" style={{ padding: 'clamp(80px, 9vw, 132px) 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px, 5vw, 80px)' }}>
            <div style={{ flex: '0 1 320px', minWidth: '260px' }}>
              <div style={{ fontFamily: mono, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pw-accent)', marginBottom: '18px' }}>FAQ</div>
              <h2 style={{ fontSize: 'clamp(34px, 4.4vw, 60px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.94, textTransform: 'uppercase', margin: 0, textWrap: 'balance' }}>Before you commit</h2>
            </div>
            <div style={{ flex: '1 1 520px', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
              {[
                {
                  q: 'What is PLOT?',
                  a: 'The ERC-20 the economy runs on. It buys goods and recruits warriors, and it is what your food and gold sell for. Several actions burn part of it — swapping goods costs 5%, withdrawing to your wallet costs 10% — so the supply drains as the game is played instead of only ever growing.',
                },
                {
                  q: 'Can I lose my land?',
                  a: "Not the land itself — the NFT stays yours. What you lose is goods: a winning attacker's survivors carry off up to 30 goods each. Walls and a standing army are how you make that unprofitable.",
                },
                {
                  q: 'Do I need crypto experience?',
                  a: 'No. Connect a wallet once and it plays like a strategy game. Every action is a transaction, so expect confirmations and timers rather than instant clicks.',
                },
                {
                  q: 'Is it pay-to-win?',
                  a: 'You buy land, not power. Every land runs the same curves — buildings double in cost per level and one worker means one job at a time, so nobody skips the queue except by paying gold per remaining minute.',
                },
                {
                  q: 'What happens when all 10,000 are gone?',
                  a: 'The map seals. The contract has no way to mint more, so new players buy from a holder on the secondary market. Sepolia stays open for practice either way.',
                },
                {
                  q: 'Which chains?',
                  a: 'Sepolia for the free testnet, Polygon for mainnet. They are separate worlds with separate contracts — nothing transfers between them, and the /testnet/ in the URL is what decides which one you are playing.',
                },
                {
                  q: 'Do I have to spend anything to try it?',
                  a: 'No. Sepolia lands cost valueless test ETH and the in-game faucet hands out test PLOT. Same contracts, same maths, nothing you can withdraw.',
                },
              ].map((item, index, all) => (
                <div
                  key={item.q}
                  style={{
                    padding: '28px 0',
                    borderTop: '1px solid rgba(244,244,241,0.14)',
                    borderBottom: index === all.length - 1 ? '1px solid rgba(244,244,241,0.14)' : undefined,
                  }}
                >
                  <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>{item.q}</div>
                  <div style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(244,244,241,0.62)', maxWidth: '62ch', textWrap: 'pretty' }}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="starter" style={{ background: 'var(--pw-accent)', color: 'var(--pw-on-accent)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(72px, 8vw, 120px) 24px', display: 'flex', flexWrap: 'wrap', gap: 'clamp(32px, 4vw, 64px)', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 480px' }}>
            <h2 style={{ fontSize: 'clamp(40px, 6.4vw, 96px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.88, textTransform: 'uppercase', margin: '0 0 20px', maxWidth: '16ch', textWrap: 'balance' }}>Learn free. Then take real ground.</h2>
            <p style={{ fontFamily: mono, fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'color-mix(in oklab, var(--pw-on-accent) 72%, transparent)', margin: 0 }}>Mainnet land opens in {mintDays}d {mintHours}h {mintMinutes}m {mintSeconds}s</p>
          </div>
          <div style={{ flex: '0 1 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Link href={TESTNET_ROUTE} style={{ background: '#0D0F12', color: '#F4F4F1', fontFamily: mono, fontSize: '14px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '24px 44px', textAlign: 'center' }}>Enter Sepolia testnet</Link>
            <Link href={MAINNET_ROUTE} style={{ border: '1px solid color-mix(in oklab, var(--pw-on-accent) 40%, transparent)', color: 'var(--pw-on-accent)', fontFamily: mono, fontSize: '14px', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '24px 44px', textAlign: 'center' }}>Mainnet land presale</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(244,244,241,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <PlotwarMark size={30} />
              <div className="pwNavBrand !text-[19px]">Plotwar</div>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '24px', color: 'rgba(244,244,241,0.5)' }}>
              <AiFillTwitterCircle />
              <FaDiscord />
              <RiTelegramFill />
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: mono, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <div style={{ color: 'rgba(244,244,241,0.35)' }}>Game</div>
              <a href="#map" style={{ color: 'rgba(244,244,241,0.7)' }}>Map</a>
              <a href="#play" style={{ color: 'rgba(244,244,241,0.7)' }}>Gameplay</a>
              <a href="#economy" style={{ color: 'rgba(244,244,241,0.7)' }}>Economy</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: mono, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <div style={{ color: 'rgba(244,244,241,0.35)' }}>Play</div>
              <Link href={TESTNET_ROUTE} style={{ color: 'rgba(244,244,241,0.7)' }}>Explore</Link>
              <Link href={routeFor(DEFAULT_TESTNET, "myLand")} style={{ color: 'rgba(244,244,241,0.7)' }}>My land</Link>
              <Link href={routeFor(DEFAULT_TESTNET, "battleLog")} style={{ color: 'rgba(244,244,241,0.7)' }}>Battle log</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: mono, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <div style={{ color: 'rgba(244,244,241,0.35)' }}>More</div>
              <a href="#roadmap" style={{ color: 'rgba(244,244,241,0.7)' }}>Roadmap</a>
              <a href="#faq" style={{ color: 'rgba(244,244,241,0.7)' }}>FAQ</a>
              <Link href={MAINNET_ROUTE} style={{ color: 'rgba(244,244,241,0.7)' }}>Mainnet presale</Link>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 48px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', fontFamily: mono, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,244,241,0.35)' }}>
          <div>© 2026 Plotwar · Testnet live · Mainnet 1 Oct 2026</div>
          <div>10,000 lands. The contract cannot make more.</div>
        </div>
      </footer>
    </div>
  );
}
