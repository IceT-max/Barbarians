'use strict';

// ── Palette ───────────────────────────────────────────────
const PAL_HERO = {
  skin:0xECC898, skinHL:0xF8DEB8, skinSh:0xC49060,
  hair:0x080808, hairHL:0x1A0C0C,
  cloth:0x0C0C14, clothHL:0x221826,
  boots:0x0A0808, bootsHL:0x1C1010,
  blade:0xCCCCC0, bladeHL:0xECECE0, bladeSh:0x909098,
  hilt:0xCC9900, hiltHL:0xEEBB22,
};
const PAL_DRAX = {
  skin:0xA86030, skinHL:0xC07840, skinSh:0x784020,
  hair:0x180C08, hairHL:0x281808,
  cloth:0x7A4C18, clothHL:0x9A6828, clothSh:0x4A2C08,
  boots:0x281408, bootsHL:0x381C08,
  blade:0xD4B818, bladeHL:0xF0D840, bladeSh:0x907808,
  hilt:0x805010, hiltHL:0xA87028,
};

const OUTLINE_CLR = 0x040202;
const OUT = 3;

// ── Palette avversari campagna (livelli 1–8) ──────────────
const CAMPAIGN_PALS = [
  // 1 Thor – capelli rossi, pelle chiara
  { skin:0xF0C890,skinHL:0xFFDCA8,skinSh:0xC09060, hair:0xA82008,hairHL:0xCC3010,
    cloth:0x1C3060,clothHL:0x2C4080, boots:0x181820,bootsHL:0x282838,
    blade:0xC4C4BC,bladeHL:0xE4E4DC,bladeSh:0x8C8C84, hilt:0xAA8800,hiltHL:0xCCAA20 },
  // 2 Magnus – capelli biondi
  { skin:0xD4A060,skinHL:0xE8B878,skinSh:0xA87848, hair:0xC8A030,hairHL:0xE0BC48,
    cloth:0x603418,clothHL:0x805028, boots:0x201008,bootsHL:0x301808,
    blade:0xC8C8C0,bladeHL:0xE8E8E0,bladeSh:0x909088, hilt:0x906010,hiltHL:0xB08030 },
  // 3 Gorak – pelle scura
  { skin:0x906040,skinHL:0xAC7858,skinSh:0x684028, hair:0x301408,hairHL:0x482010,
    cloth:0x1A4030,clothHL:0x2A5840, boots:0x140C04,bootsHL:0x241408,
    blade:0xBCBCB4,bladeHL:0xDCDCD4,bladeSh:0x848480, hilt:0x887020,hiltHL:0xA89030 },
  // 4 Sven – capelli bianchi, pelle pallida
  { skin:0xF0D8C0,skinHL:0xFFECD8,skinSh:0xC8B098, hair:0xD0CCC0,hairHL:0xECE8DC,
    cloth:0x501858,clothHL:0x703070, boots:0x180C20,bootsHL:0x281838,
    blade:0xD0D0C8,bladeHL:0xF0F0E8,bladeSh:0x989890, hilt:0xA09060,hiltHL:0xC0B080 },
  // 5 Mordak – pelle grigiastra
  { skin:0x9898A8,skinHL:0xB4B4C4,skinSh:0x707080, hair:0x080808,hairHL:0x141414,
    cloth:0x400808,clothHL:0x600C0C, boots:0x100404,bootsHL:0x200808,
    blade:0xD4D4CC,bladeHL:0xF0F0E8,bladeSh:0x9C9C94, hilt:0x8C6018,hiltHL:0xAC8030 },
  // 6 Zarak – pelle verdastra
  { skin:0x688040,skinHL:0x88A058,skinSh:0x485820, hair:0x980808,hairHL:0xB81010,
    cloth:0x2C1808,clothHL:0x4C2C10, boots:0x100804,bootsHL:0x201008,
    blade:0xC8C4B8,bladeHL:0xE8E4D8,bladeSh:0x908C80, hilt:0x807030,hiltHL:0xA09050 },
  // 7 Krom – capelli argentati, pelle scura
  { skin:0x784838,skinHL:0x946050,skinSh:0x583028, hair:0xB0B8C0,hairHL:0xD0D8E0,
    cloth:0x0A1C38,clothHL:0x142848, boots:0x060C14,bootsHL:0x0C1820,
    blade:0xD8D8D0,bladeHL:0xF8F8F0,bladeSh:0xA0A098, hilt:0x988028,hiltHL:0xB8A040 },
  // 8 Valdor – campione (capelli neri, abiti scarlatti)
  { skin:0xE8C8A0,skinHL:0xF8DCC0,skinSh:0xC0A078, hair:0x0A0606,hairHL:0x180C0C,
    cloth:0x5C0808,clothHL:0x7C0C0C, boots:0x200808,bootsHL:0x301010,
    blade:0xE0E0D8,bladeHL:0xFFFFFF,bladeSh:0xA8A8A0, hilt:0xC0A820,hiltHL:0xE0C830 },
];

// ── Geometria helper ─────────────────────────────────────
function lp(x1,y1,x2,y2,w) {
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);
  if(L<1) return null;
  const nx=-dy/L*(w/2),ny=dx/L*(w/2);
  return [x1+nx,y1+ny, x2+nx,y2+ny, x2-nx,y2-ny, x1-nx,y1-ny];
}
function lpHL(x1,y1,x2,y2,w) {
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);
  if(L<1) return null;
  const nx=-dy/L*(w/2),ny=dx/L*(w/2);
  return [x1+nx,y1+ny, x2+nx,y2+ny, x2+nx*0.15,y2+ny*0.15, x1+nx*0.15,y1+ny*0.15];
}
function expandPoly(pts,amt) {
  let cx=0,cy=0; const n=pts.length>>1;
  for(let i=0;i<pts.length;i+=2){cx+=pts[i];cy+=pts[i+1];}
  cx/=n; cy/=n;
  const o=[];
  for(let i=0;i<pts.length;i+=2){
    const dx=pts[i]-cx,dy=pts[i+1]-cy,L=Math.hypot(dx,dy)||1;
    o.push(pts[i]+dx/L*amt, pts[i+1]+dy/L*amt);
  }
  return o;
}

// ── Primitive ────────────────────────────────────────────
function fPoly(g,pts,color,noOutline) {
  if(!pts||pts.length<6) return;
  if(!noOutline){g.beginFill(OUTLINE_CLR);g.drawPolygon(expandPoly(pts,OUT));}
  g.beginFill(color);g.drawPolygon(pts);
}
function fCircle(g,cx,cy,r,color,noOutline) {
  if(!noOutline){g.beginFill(OUTLINE_CLR);g.drawCircle(cx,cy,r+2);}
  g.beginFill(color);g.drawCircle(cx,cy,r);
}
function fRect(g,x,y,w,h,color,noOutline) {
  if(!noOutline){g.beginFill(OUTLINE_CLR);g.drawRect(x-2,y-2,w+4,h+4);}
  g.beginFill(color);g.drawRect(x,y,w,h);
}

// ── Arto generico ─────────────────────────────────────────
function drawLimb(g,x1,y1,x2,y2,w,base,hl) {
  fPoly(g,lp(x1,y1,x2,y2,w+OUT*2),OUTLINE_CLR,true);
  fPoly(g,lp(x1,y1,x2,y2,w),base,true);
  if(hl!==undefined) fPoly(g,lpHL(x1,y1,x2,y2,w),hl,true);
}

// ── Braccio con bicipite ──────────────────────────────────
function drawArm(g,x1,y1,x2,y2,pal) {
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);
  if(L<2) return;
  const nx=-dy/L, ny=dx/L;
  // Outline unificato
  fPoly(g,lp(x1,y1,x2,y2,14+OUT*2),OUTLINE_CLR,true);
  // Braccio superiore (più spesso)
  const ex=x1+dx*0.52, ey=y1+dy*0.52;
  fPoly(g,lp(x1,y1,ex,ey,13),pal.skin,true);
  fPoly(g,lpHL(x1,y1,ex,ey,13),pal.skinHL,true);
  // Rigonfiamento bicipite
  const bx=x1+dx*0.32, by=y1+dy*0.32;
  g.beginFill(pal.skinHL);
  g.drawEllipse(bx+nx*3,by+ny*3,7,6);
  // Avambraccio (più sottile)
  fPoly(g,lp(ex,ey,x2,y2,10),pal.skin,true);
  fPoly(g,lpHL(ex,ey,x2,y2,10),pal.skinHL,true);
}

// ── Gamba con coscia/polpaccio ────────────────────────────
function drawLeg(g,x1,y1,x2,y2,pal) {
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);
  if(L<2) return;
  const nx=-dy/L, ny=dx/L;
  // Outline unificato
  fPoly(g,lp(x1,y1,x2,y2,16+OUT*2),OUTLINE_CLR,true);
  // Coscia (più spessa)
  const kx=x1+dx*0.52, ky=y1+dy*0.52;
  fPoly(g,lp(x1,y1,kx,ky,15),pal.skin,true);
  fPoly(g,lpHL(x1,y1,kx,ky,15),pal.skinHL,true);
  // Rigonfiamento quadricipite
  const qx=x1+dx*0.30, qy=y1+dy*0.30;
  g.beginFill(pal.skinHL);
  g.drawEllipse(qx+nx*5,qy+ny*5,8,11);
  // Stinco/polpaccio (più sottile)
  fPoly(g,lp(kx,ky,x2,y2,12),pal.skin,true);
  fPoly(g,lpHL(kx,ky,x2,y2,12),pal.skinHL,true);
  // Highlight polpaccio
  const cx2=x1+dx*0.72, cy2=y1+dy*0.72;
  g.beginFill(pal.skinHL);
  g.drawEllipse(cx2-nx*4,cy2-ny*4,6,8);
}

// ── Testa realistica ──────────────────────────────────────
function drawHead(g,cx,cy,pal) {
  // Capelli (silhouette dietro)
  const hPts=[
    cx-16,cy+4, cx-15,cy-8, cx-11,cy-18,
    cx-5,cy-26,  cx,cy-31,  cx+5,cy-26,
    cx+11,cy-18, cx+15,cy-8, cx+16,cy+4,
  ];
  fPoly(g,hPts,pal.hair);
  if(pal.hairHL){
    g.beginFill(pal.hairHL);
    g.drawPolygon([cx-4,cy-27,cx,cy-32,cx+4,cy-27,cx+2,cy-22,cx-2,cy-22]);
  }
  // Collo
  g.beginFill(OUTLINE_CLR); g.drawRect(cx-7,cy+12,16,13);
  g.beginFill(pal.skin);    g.drawRect(cx-6,cy+13,13,11);
  g.beginFill(pal.skinSh);  g.drawRect(cx+3,cy+13, 4,11);
  // Cranio ovale
  g.beginFill(OUTLINE_CLR); g.drawEllipse(cx,cy-1,17,18);
  g.beginFill(pal.skin);    g.drawEllipse(cx,cy-1,15,16);
  // Mandibola
  const jaw=[cx-13,cy+7,cx+13,cy+7,cx+9,cy+16,cx,cy+18,cx-9,cy+16];
  g.beginFill(OUTLINE_CLR); g.drawPolygon(expandPoly(jaw,2));
  g.beginFill(pal.skin);    g.drawPolygon(jaw);
  g.beginFill(pal.skinSh);
  g.drawPolygon([cx+4,cy+7,cx+13,cy+7,cx+9,cy+16,cx,cy+18,cx+1,cy+13]);
  // Orecchio
  g.beginFill(OUTLINE_CLR); g.drawEllipse(cx-15,cy+2,5,7);
  g.beginFill(pal.skin);    g.drawEllipse(cx-15,cy+2,4,6);
  g.beginFill(pal.skinSh);  g.drawEllipse(cx-14,cy+3,2,3);
  // Highlights pelle
  g.beginFill(pal.skinHL); g.drawEllipse(cx-3,cy-9,7,5);
  g.beginFill(pal.skinHL); g.drawEllipse(cx-6,cy+1,5,4);
  // Sopracciglia inclinate
  g.beginFill(pal.hair);
  g.drawPolygon([cx-13,cy-8,cx-4,cy-11,cx-4,cy-8,cx-12,cy-6]);
  g.drawPolygon([cx+4,cy-11,cx+13,cy-8,cx+12,cy-6,cx+4,cy-8]);
  // Occhi: sclera + iride + pupilla + riflesso
  g.beginFill(OUTLINE_CLR); g.drawEllipse(cx-7,cy-4,7,4);
  g.beginFill(OUTLINE_CLR); g.drawEllipse(cx+7,cy-4,7,4);
  g.beginFill(0xEEEEEE);    g.drawEllipse(cx-7,cy-4,6,3);
  g.beginFill(0xEEEEEE);    g.drawEllipse(cx+7,cy-4,6,3);
  g.beginFill(0x1E1008);    g.drawCircle(cx-7,cy-4,2.2);
  g.beginFill(0x1E1008);    g.drawCircle(cx+7,cy-4,2.2);
  g.beginFill(0xFFFFFF);    g.drawCircle(cx-6,cy-5,0.9);
  g.beginFill(0xFFFFFF);    g.drawCircle(cx+8,cy-5,0.9);
  // Naso con narici
  g.beginFill(pal.skinSh);
  g.drawPolygon([cx-1,cy,cx+1,cy,cx+4,cy+5,cx+2,cy+8,cx-2,cy+8,cx-4,cy+5]);
  g.drawCircle(cx-3,cy+7,2);
  g.drawCircle(cx+3,cy+7,2);
  // Bocca con labbra
  g.beginFill(OUTLINE_CLR); g.drawRect(cx-6,cy+10,12,5);
  g.beginFill(0x7A2020);    g.drawRect(cx-5,cy+11,10,3);
  g.beginFill(pal.skinSh);  g.drawRect(cx-5,cy+10,10,2);
  g.beginFill(pal.skinHL);  g.drawRect(cx-4,cy+13, 8,1);
}

// ── Stivale ────────────────────────────────────────────────
function drawBoot(g,ax,ay,fwdRight,pal) {
  const d=fwdRight?1:-1;
  drawLimb(g,ax,ay-16,ax,ay,15,pal.boots,pal.bootsHL);
  const toe=[ax-9,ay,ax+9,ay,ax+9+d*13,ay+13,ax-5+d*2,ay+13];
  fPoly(g,toe,pal.boots);
  g.beginFill(OUTLINE_CLR); g.drawRect(ax-9+d,ay+11,22,4);
  g.beginFill(pal.bootsHL); g.drawRect(ax-7+d*2,ay-14,4,12);
  g.beginFill(pal.bootsHL); g.drawRect(ax-2+d*3,ay+2,5,4);
}

// ── Torso muscoloso con spalle ────────────────────────────
function drawTorso(g,pts,cx,wY,pal) {
  g.beginFill(OUTLINE_CLR); g.drawPolygon(expandPoly(pts,OUT));
  g.beginFill(pal.skin);    g.drawPolygon(pts);
  const tY=Math.min(pts[1],pts[3]);
  const midY=tY+(wY-tY)*0.45;
  // Pettorali
  g.beginFill(pal.skinHL);
  g.drawPolygon([cx-20,tY+3,cx-2,tY+1,cx-2,midY,cx-18,midY+3]);
  g.drawPolygon([cx+2, tY+1,cx+20,tY+3,cx+18,midY+3,cx+2,midY]);
  // Deltoidi (cappucci spalla)
  g.beginFill(pal.skinHL);
  g.drawEllipse(pts[0]+8,pts[1]+5,14,10);
  g.drawEllipse(pts[2]-8,pts[3]+5,14,10);
  g.beginFill(pal.skinSh);
  g.drawEllipse(pts[0]+3,pts[1]+9,6,7);
  g.drawEllipse(pts[2]-3,pts[3]+9,6,7);
  // Linea sternale
  g.beginFill(pal.skinSh); g.drawRect(cx-1,tY+5,2,(wY-tY)*0.50|0);
  // Addominali
  const abTop=tY+(wY-tY)*0.52;
  const abH=((wY-tY)*0.12)|0;
  for(let ab=0;ab<3;ab++){
    const abY=(abTop+ab*abH*1.4)|0;
    g.beginFill(pal.skinSh);
    g.drawRect(cx-12,abY,10,abH>2?2:1);
    g.drawRect(cx+2, abY,10,abH>2?2:1);
  }
  // Ombra lato destro
  g.beginFill(pal.skinSh);
  g.drawPolygon([pts[2]-6,pts[3],pts[2]+2,pts[3],pts[4]+2,pts[5],pts[4]-4,pts[5]]);
}

// ── Perizoma ──────────────────────────────────────────────
function drawLoincloth(g,cx,wY,pal) {
  fRect(g,cx-24,wY-5,48,10,pal.hilt);
  g.beginFill(pal.hiltHL); g.drawRect(cx-22,wY-3,44,4);
  const skirt=[cx-22,wY+5,cx+22,wY+5,cx+14,wY+38,cx,wY+44,cx-14,wY+38];
  fPoly(g,skirt,pal.cloth);
  g.beginFill(pal.clothHL);
  g.drawPolygon([cx-4,wY+5,cx+4,wY+5,cx+2,wY+32,cx,wY+36,cx-2,wY+32]);
}

// ── Spada ─────────────────────────────────────────────────
function drawSword(g,tx,ty,gx,gy,pal) {
  const dx=tx-gx,dy=ty-gy,L=Math.hypot(dx,dy);
  if(L<2) return;
  const nx=-dy/L, ny=dx/L;
  const fdx=dx/L*10, fdy=dy/L*10;
  fPoly(g,[gx+nx*8,gy+ny*8,tx+nx*3,ty+ny*3,tx-nx,ty-ny,gx-nx*8,gy-ny*8],pal.bladeSh,true);
  fPoly(g,[gx+nx*6,gy+ny*6,tx+nx*2,ty+ny*2,tx,ty,tx-nx*2,ty-ny*2,gx-nx*6,gy-ny*6],pal.blade);
  g.beginFill(pal.bladeHL);
  g.drawPolygon([gx+nx*5,gy+ny*5,tx+nx*1,ty+ny*1,tx,ty,gx+nx*0.5,gy+ny*0.5]);
  const gx1=gx+nx*17+fdx*0.4, gy1=gy+ny*17+fdy*0.4;
  const gx2=gx+nx*17+fdx,     gy2=gy+ny*17+fdy;
  const gx3=gx-nx*17+fdx,     gy3=gy-ny*17+fdy;
  const gx4=gx-nx*17+fdx*0.4, gy4=gy-ny*17+fdy*0.4;
  fPoly(g,[gx1,gy1,gx2,gy2,gx3,gy3,gx4,gy4],pal.hilt);
  g.beginFill(pal.hiltHL);
  g.drawPolygon([gx1,gy1,gx2,gy2,gx2+nx*2,gy2+ny*2,gx1+nx*2,gy1+ny*2]);
  fPoly(g,lp(gx,gy,gx+fdx*2,gy+fdy*2,8),pal.cloth);
  fCircle(g,gx+fdx*2.3,gy+fdy*2.3,5,pal.hilt);
}

// ── Personaggio completo ──────────────────────────────────
function drawFighter(g,pose,pal) {
  const cx  = pose.cx     !== undefined ? pose.cx     : 40;
  const wY  = pose.waistY !== undefined ? pose.waistY : 80;
  const tPts = pose.torso || [18,42,62,42,54,82,24,82];
  drawLeg (g,pose.lLeg[0],pose.lLeg[1],pose.lLeg[2],pose.lLeg[3],pal);
  if(!pose.noBoots) drawBoot(g,pose.lLeg[2],pose.lLeg[3],false,pal);
  drawArm (g,pose.lArm[0],pose.lArm[1],pose.lArm[2],pose.lArm[3],pal);
  drawTorso(g,tPts,cx,wY,pal);
  drawLoincloth(g,cx,wY,pal);
  drawLeg (g,pose.rLeg[0],pose.rLeg[1],pose.rLeg[2],pose.rLeg[3],pal);
  if(!pose.noBoots) drawBoot(g,pose.rLeg[2],pose.rLeg[3],true,pal);
  drawHead(g,pose.head[0],pose.head[1],pal);
  drawArm (g,pose.rArm[0],pose.rArm[1],pose.rArm[2],pose.rArm[3],pal);
  if(pose.sword) drawSword(g,pose.sword[0],pose.sword[1],pose.sword[2],pose.sword[3],pal);
}

// ── Personaggio disteso (morte) ───────────────────────────
function drawFighterFlat(g,decap,pal,noHead) {
  const gY=112;
  drawLimb(g,18,gY-5,64,gY-9,18,pal.skin,pal.skinHL);
  drawLimb(g,18,gY-5, 6,gY+7,11,pal.skin,pal.skinHL);
  drawLimb(g,54,gY-5,72,gY+2,14,pal.skin,pal.skinHL);
  drawLimb(g,60,gY-9,82,gY-4,14,pal.skin,pal.skinHL);
  drawBoot(g,72,gY+2,true,pal);
  drawBoot(g,82,gY-4,true,pal);
  const wPts=[16,gY-16,64,gY-20,60,gY-6,20,gY-4];
  drawTorso(g,wPts,38,gY-10,pal);
  drawLoincloth(g,38,gY-16,pal);
  if(!noHead) drawHead(g,decap?78:8,decap?gY-22:gY-5,pal);
  fPoly(g,lp(24,gY+5,102,gY+3,5),pal.blade);
  fPoly(g,lp(26,gY+4,102,gY+2,2),pal.bladeHL,true);
}

// ── Definizioni pose ──────────────────────────────────────
const IDLE_POSES = [
  { head:[40,18], lArm:[20,44,10,72], rArm:[62,44,70,70],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[88,-2,70,70] },
  { head:[40,17], lArm:[20,43,10,71], rArm:[62,43,70,69],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[88,-3,70,69],
    torso:[17,41,65,41,57,82,23,82] },
];
const WALK_POSES = [
  { head:[40,18], lArm:[20,44,10,72], rArm:[62,44,70,70],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[88,-2,70,70] },
  { head:[40,17], lArm:[20,44,4,64],  rArm:[62,44,76,64],
    lLeg:[30,84,12,114], rLeg:[50,84,66,116], sword:[90,-4,76,64] },
  { head:[40,18], lArm:[20,44,10,72], rArm:[62,44,70,70],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[88,-2,70,70] },
  { head:[40,17], lArm:[20,44,18,66], rArm:[62,44,62,70],
    lLeg:[30,84,46,116], rLeg:[50,84,36,114], sword:[78,-4,62,70] },
];
const SLASH_POSES = [
  { head:[40,18], lArm:[20,44,12,70], rArm:[62,44,46,30],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[-10,-14,46,30] },
  { head:[40,18], lArm:[20,44,8,64],  rArm:[62,44,76,54],
    lLeg:[28,84,22,118], rLeg:[52,84,58,118], sword:[124,50,76,54] },
  { head:[40,19], lArm:[20,44,10,72], rArm:[62,44,74,70],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[114,82,74,70] },
];
const OVERHEAD_POSES = [
  { head:[40,18], lArm:[20,44,10,64], rArm:[62,44,52,18],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[52,-60,52,18] },
  { head:[40,18], lArm:[20,44,8,60],  rArm:[62,44,70,28],
    lLeg:[28,84,22,118], rLeg:[52,84,58,118], sword:[106,16,70,28] },
  { head:[40,19], lArm:[20,44,10,70], rArm:[62,44,72,68],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[118,84,72,68] },
];
const THRUST_POSES = [
  { head:[40,18], lArm:[20,44,14,70], rArm:[62,44,50,42],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118], sword:[16,22,50,42] },
  { head:[42,18], lArm:[20,44,10,72], rArm:[62,44,92,36],
    lLeg:[24,84,16,118], rLeg:[54,84,64,118], sword:[162,12,92,36],
    torso:[17,42,68,42,62,84,22,84] },
  { head:[40,18], lArm:[20,44,10,70], rArm:[62,44,78,52],
    lLeg:[28,84,22,118], rLeg:[52,84,58,118], sword:[104,22,78,52] },
];
const BLOCK_POSE = {
  head:[38,18], lArm:[20,44,22,60], rArm:[62,44,62,52],
  lLeg:[28,84,22,118], rLeg:[52,84,56,118], sword:[38,10,62,52],
};
const HIT_POSE = {
  head:[32,22], lArm:[20,46,2,58], rArm:[60,42,74,56],
  lLeg:[32,86,26,120], rLeg:[46,82,50,116],
  sword:[88,64,74,56], torso:[20,48,56,42,52,84,20,84],
};
const JUMP_POSE = {
  head:[40,12], lArm:[20,42,6,56],  rArm:[62,42,78,54],
  lLeg:[30,82,18,102], rLeg:[50,82,62,102], sword:[90,-10,78,54],
};
const DUCK_POSE = {
  head:[40,56], lArm:[20,62,8,76],  rArm:[60,62,68,76],
  lLeg:[28,82,12,114], rLeg:[52,82,68,114],
  sword:[76,18,68,76], torso:[18,56,62,56,58,82,22,82],
  waistY:78, cx:40,
};
const DEAD_POSES = [
  { head:[30,74], lArm:[22,62,4,76], rArm:[56,54,70,70],
    lLeg:[30,90,18,122], rLeg:[46,86,60,122],
    sword:[92,82,70,70], torso:[20,54,56,48,58,92,22,92], waistY:84 },
];

const POSE_MAP = {
  idle: IDLE_POSES, walk: WALK_POSES,
  slash: SLASH_POSES, overhead: OVERHEAD_POSES, thrust: THRUST_POSES,
  block:[BLOCK_POSE], hit:[HIT_POSE], jump:[JUMP_POSE],
  duck:[DUCK_POSE], dead:DEAD_POSES,
};

// ── FighterView ───────────────────────────────────────────
const CHAR_SCALE = 1.65;

class FighterView {
  constructor(pal) {
    this.container = new PIXI.Container();
    this.gfx       = new PIXI.Graphics();
    this.container.addChild(this.gfx);
    this.pal      = pal;
    this._lastKey = '';
  }

  update(fighter) {
    const key = fighter.state+'|'+fighter.frame+'|'+fighter.decapitated+'|'+(fighter.headKicked||0);
    if (key !== this._lastKey) { this._redraw(fighter); this._lastKey = key; }

    const S = CHAR_SCALE;
    this.container.y       = Math.round(fighter.y) - Math.round(SPRITE_H*(S-1));
    this.container.scale.y = S;
    if (fighter.facingRight) {
      this.container.x       = Math.round(fighter.x);
      this.container.scale.x = S;
    } else {
      this.container.x       = Math.round(fighter.x) + Math.round(SPRITE_W*S);
      this.container.scale.x = -S;
    }
    this.container.alpha = (fighter.hitFlash > 0 && fighter.hitFlash % 3 < 2) ? 0.3 : 1.0;
  }

  _redraw(fighter) {
    this.gfx.clear();
    if (fighter.state === 'dead' && fighter.frame >= 1) {
      drawFighterFlat(this.gfx, fighter.decapitated, this.pal, fighter.headKicked); return;
    }
    const frames = POSE_MAP[fighter.state];
    if (!frames) return;
    const pose = frames[fighter.frame % frames.length];
    if (pose) drawFighter(this.gfx, pose, this.pal);
  }
}

// ── Goblin ────────────────────────────────────────────────
function buildGoblinGfx() {
  const g   = new PIXI.Graphics();
  const sk  = 0x4A8A30, skHL = 0x6AAA40, skSh = 0x2A5820;
  const cl  = 0x3A2000, clHL = 0x4A3000;
  const bt  = 0x1A0A00;
  const O   = OUTLINE_CLR;

  // ── Gambe corte e tozze ──
  drawLimb(g, 16,36, 12,50, 9, sk, skHL);
  drawLimb(g, 24,36, 28,50, 9, sk, skHL);
  // Stivali
  fPoly(g, [5,48,16,48,17,54,4,54],  bt);
  fPoly(g, [23,48,34,48,35,54,22,54], bt);

  // ── Braccio sinistro (lungo, pende basso) ──
  drawLimb(g, 14,22, 2,44, 8, sk, skHL);
  // Artigli sinistri
  g.beginFill(O);
  g.drawPolygon(expandPoly([-2,42, 0,50, 2,43], 1.5));
  g.drawPolygon(expandPoly([ 2,43, 2,51, 4,44], 1.5));
  g.drawPolygon(expandPoly([ 5,42, 7,49, 7,43], 1.5));
  g.beginFill(skSh);
  g.drawPolygon([-2,42, 0,50, 2,43]);
  g.drawPolygon([ 2,43, 2,51, 4,44]);
  g.drawPolygon([ 5,42, 7,49, 7,43]);

  // ── Torso goboso ──
  fPoly(g, [12,36, 28,36, 27,18, 13,18], sk);
  g.beginFill(skSh); g.drawEllipse(13,28, 5,10); // gobba schiena
  g.beginFill(skHL); g.drawEllipse(24,22, 4, 8); // highlight petto

  // ── Perizoma ──
  fPoly(g, [11,34, 29,34, 27,44, 20,46, 13,44], cl);
  g.beginFill(clHL);
  g.drawPolygon([13,34, 21,34, 19,41, 17,42, 15,41, 13,38]);

  // ── Braccio destro (lungo) ──
  drawLimb(g, 26,22, 38,44, 8, sk, skHL);
  // Artigli destri
  g.beginFill(O);
  g.drawPolygon(expandPoly([33,42, 31,50, 34,44], 1.5));
  g.drawPolygon(expandPoly([36,43, 36,51, 39,45], 1.5));
  g.drawPolygon(expandPoly([39,42, 41,49, 42,43], 1.5));
  g.beginFill(skSh);
  g.drawPolygon([33,42, 31,50, 34,44]);
  g.drawPolygon([36,43, 36,51, 39,45]);
  g.drawPolygon([39,42, 41,49, 42,43]);

  // ── Orecchie grandi e appuntite ──
  fPoly(g, [9,6, -5,0, 7,14, 9,14], sk);
  g.beginFill(skSh); g.drawPolygon([9,7, 0,3, 7,13, 9,13]);
  fPoly(g, [31,6, 45,0, 33,14, 31,14], sk);
  g.beginFill(skSh); g.drawPolygon([31,7, 40,3, 33,13, 31,13]);

  // ── Cranio (largo e schiacciato) ──
  g.beginFill(O);  g.drawEllipse(20,8, 16,13);
  g.beginFill(sk); g.drawEllipse(20,8, 14,11);

  // Sopracciglio prominente (arco unico)
  fPoly(g, [7,5, 33,5, 31,9, 9,9], skSh);

  // ── Naso grande e adunco ──
  fPoly(g, [17,8, 23,8, 25,14, 26,19, 22,21, 18,21, 15,19, 16,14], sk);
  g.beginFill(skSh);
  g.drawPolygon([22,11, 25,17, 24,20, 21,21, 21,16]);
  g.beginFill(O); g.drawEllipse(18,20,3,2); g.drawEllipse(23,20,3,2); // narici

  // ── Occhi beady (iride gialla, pupilla nera) ──
  g.beginFill(O);      g.drawEllipse(13,7,5,4); g.drawEllipse(27,7,5,4);
  g.beginFill(0xFFAA00); g.drawEllipse(13,7,4,3); g.drawEllipse(27,7,4,3);
  g.beginFill(O);      g.drawCircle(13,7,1.8);   g.drawCircle(27,7,1.8);
  g.beginFill(0xFFFFFF); g.drawCircle(12,6,0.7);  g.drawCircle(26,6,0.7);

  // ── Bocca larga con denti e zanne ──
  g.beginFill(O); g.drawPolygon(expandPoly([9,22,31,22,29,27,20,28,11,27],1.5));
  g.beginFill(0x3A0808); g.drawPolygon([9,22,31,22,29,27,20,28,11,27]);
  // Denti
  g.beginFill(0xEEE8CC);
  g.drawPolygon([10,22,13,22,12,25]);
  g.drawPolygon([14,22,17,22,17,25,14,25]);
  g.drawPolygon([18,22,21,22,21,25,18,25]);
  g.drawPolygon([22,22,25,22,25,25,22,25]);
  g.drawPolygon([26,22,29,22,28,25]);
  // Zanne
  g.beginFill(0xF0ECC0);
  g.drawPolygon([11,22,14,22,13,29,11,26]);
  g.drawPolygon([26,22,29,22,28,26,26,29]);

  // ── Capelli ispidi ──
  g.beginFill(0x1C0E0E);
  g.drawPolygon([7,2,9,-5,12,0,15,-6,17,-1,
                 20,-7,23,-1,25,-5,28,0,31,-4,33,2,28,5,12,5]);

  return g;
}

// ── Testa rotolante (decapitazione) ───────────────────────
function buildRollingHeadGfx(g, pal) {
  g.clear();
  g.beginFill(OUTLINE_CLR); g.drawCircle(0, 0, 17);
  g.beginFill(pal.hair);    g.drawEllipse(0, -7, 14, 11);
  g.beginFill(pal.skin);    g.drawCircle(0, 1, 14);
  const jaw=[-12,7, 12,7, 9,15, 0,17, -9,15];
  g.beginFill(OUTLINE_CLR); g.drawPolygon(expandPoly(jaw, 2));
  g.beginFill(pal.skin);    g.drawPolygon(jaw);
  g.beginFill(pal.skinSh);
  g.drawPolygon([3,7, 12,7, 9,15, 0,17, 1,12]);
  g.beginFill(OUTLINE_CLR); g.drawEllipse(-7, -1, 7, 4);
  g.beginFill(OUTLINE_CLR); g.drawEllipse( 7, -1, 7, 4);
  g.beginFill(0xEEEEEE);    g.drawEllipse(-7, -1, 6, 3);
  g.beginFill(0xEEEEEE);    g.drawEllipse( 7, -1, 6, 3);
  g.beginFill(0x1E1008);    g.drawCircle(-7, -1, 2.2);
  g.beginFill(0x1E1008);    g.drawCircle( 7, -1, 2.2);
  g.beginFill(0xFFFFFF);    g.drawCircle(-6, -2, 0.9);
  g.beginFill(0xFFFFFF);    g.drawCircle( 8, -2, 0.9);
  g.beginFill(pal.skinSh);
  g.drawPolygon([-1,3, 1,3, 3,7, 1,9, -1,9, -3,7]);
  g.drawCircle(-3, 8, 1.5); g.drawCircle(3, 8, 1.5);
  g.beginFill(OUTLINE_CLR); g.drawRect(-5, 10, 10, 4);
  g.beginFill(0x7A2020);    g.drawRect(-4, 11, 8, 2);
}

// ── Arena ─────────────────────────────────────────────────
function buildArena() {
  const g  = new PIXI.Graphics();
  const W  = 800, H = 500, gY = GROUND_Y;
  const CW = 130;

  // CIELO
  g.beginFill(0x1A5E99); g.drawRect(0, 0, W, H);
  g.beginFill(0x2470AA); g.drawRect(0, 0, W, 160);
  g.beginFill(0x3A8FCC); g.drawRect(0, 100, W, 120);
  g.beginFill(0x52A8DA); g.drawRect(0, 200, W, 80);
  g.beginFill(0x70BBDD); g.drawRect(0, 270, W, 60);

  // NUVOLE
  _cloud(g, 290,  72, 130, 42);
  _cloud(g, 470,  55, 110, 36);
  _cloud(g, 380, 105,  80, 26);

  // FORESTA — 4 strati
  _forestLayer(g, CW, W-CW, gY, 0x0B1C07, 90, 220, 52, 0.0);
  _forestLayer(g, CW-8, W-CW+8, gY, 0x152E0A, 65, 165, 40, 0.3);
  _forestLayer(g, CW-4, W-CW+4, gY, 0x1D4410, 50, 125, 32, 0.6);

  // Cespugli in primo piano
  g.beginFill(0x2A5E14);
  for (let bx = CW+5; bx < W-CW-5; bx += 36)
    g.drawEllipse(bx+18, gY-10, 24, 17);
  g.beginFill(0x3A7A1E);
  for (let bx = CW+14; bx < W-CW-14; bx += 26)
    g.drawEllipse(bx+13, gY-5, 17, 12);

  // SUOLO
  g.beginFill(0x286010); g.drawRect(0, gY, W, H-gY);
  g.beginFill(0x3C8818); g.drawRect(0, gY, W, 18);
  g.beginFill(0x52B022); g.drawRect(0, gY, W, 8);
  g.beginFill(0x6ACC2A);
  for (let bx = CW+4; bx < W-CW-4; bx += 12) {
    g.drawPolygon([bx,gY, bx+3,gY, bx+2,gY-9, bx+1,gY-12]);
    g.drawPolygon([bx+6,gY, bx+9,gY, bx+8,gY-7, bx+7,gY-9]);
  }
  g.lineStyle(2, 0x88DD3A, 0.9); g.moveTo(0,gY); g.lineTo(W,gY); g.lineStyle(0);

  // COLONNE SERPENTE
  _snakeCol(g, 0,    0, H, CW, false);
  _snakeCol(g, W-CW, 0, H, CW, true);

  g.endFill();
  return g;
}

// Strato foresta con alberi a chioma rotonda
function _forestLayer(g, x0, x1, gY, color, step, hRange, r, seed) {
  g.beginFill(color);
  for (let tx = x0; tx < x1; tx += step) {
    const h = 120 + ((tx*71 + seed*1000|0) % hRange);
    const cx2 = tx + step/2;
    const baseY = gY - 4;
    g.drawRect(cx2-5, baseY-h, 10, h*0.28);
    g.drawCircle(cx2, baseY-h+r*0.55, r);
    g.drawCircle(cx2-r*0.5, baseY-h+r*0.85, r*0.78);
    g.drawCircle(cx2+r*0.5, baseY-h+r*0.85, r*0.78);
    g.drawCircle(cx2, baseY-h+r*1.15, r*0.80);
  }
}

// Nuvola
function _cloud(g, cx, cy, rw, rh) {
  g.beginFill(0xEEEEFF, 0.96);
  g.drawEllipse(cx,          cy,       rw*0.55, rh*0.72);
  g.drawEllipse(cx-rw*0.30,  cy+rh*0.12, rw*0.42, rh*0.58);
  g.drawEllipse(cx+rw*0.30,  cy+rh*0.12, rw*0.42, rh*0.58);
  g.drawEllipse(cx-rw*0.08,  cy+rh*0.22, rw*0.50, rh*0.46);
  g.endFill();
}

// Colonna tronco d'albero con serpente avvolto
function _snakeCol(g, x, yTop, yBot, cw, mirror) {
  const h   = yBot - yTop;
  const tw  = Math.round(cw * 0.44);         // larghezza tronco
  const tx  = x + Math.round(cw * (mirror ? 0.30 : 0.26)); // sinistra tronco
  const tcx = tx + tw/2;
  const coilH = 110;  // altezza giro completo
  const snW   = 24;   // spessore serpente

  // === Sfondo scuro ===
  g.beginFill(0x060806); g.drawRect(x, yTop, cw, h);

  // === Bobine POSTERIORI (dietro tronco – scure, sui lati) ===
  g.beginFill(0x0E4A06);
  for (let sy = yTop - coilH; sy < yBot + coilH; sy += coilH) {
    // Va dal lato al tronco (dietro)
    const sideX = mirror ? x+cw-4 : x+4;
    const trunkEdge = mirror ? tx+tw : tx;
    const mid = sy + coilH*0.25;
    const b1  = lp(sideX, sy, trunkEdge, mid, snW-6);
    if (b1) g.drawPolygon(b1);
    const trunkEdge2 = mirror ? tx : tx+tw;
    const sideX2     = mirror ? x+4 : x+cw-4;
    const mid2 = sy + coilH*0.75;
    const b2 = lp(trunkEdge2, mid2, sideX2, sy+coilH, snW-6);
    if (b2) g.drawPolygon(b2);
  }

  // === TRONCO ===
  g.beginFill(0x3A2008); g.drawRect(tx, yTop, tw, h);
  g.beginFill(0x5A3814); g.drawRect(tx+3, yTop, tw-10, h);
  g.beginFill(0x6A4820); g.drawRect(tx+5, yTop, tw-18, h);
  // Nodi del legno
  for (let ny = yTop+55; ny < yBot; ny += 88) {
    g.beginFill(0x281404); g.drawEllipse(tcx, ny, tw*0.44, 11);
    g.beginFill(0x4A3010); g.drawEllipse(tcx+2, ny, tw*0.30, 7);
  }
  g.beginFill(0x7A5828); g.drawRect(tx, yTop, 5, h);       // luce sinistra
  g.beginFill(0x180A02); g.drawRect(tx+tw-8, yTop, 8, h);  // ombra destra

  // === Bobine FRONTALI (in front del tronco) ===
  const snDark   = 0x145E08;
  const snBright = 0x2A9A0E;
  const snHL     = 0x50C428;
  const snBelly  = 0xA8CC42;

  for (let sy = yTop - coilH; sy < yBot + coilH; sy += coilH) {
    // front coil: diagonale da un lato all'altro attraverso il davanti del tronco
    const y1 = sy + coilH*0.25;
    const y2 = sy + coilH*0.75;
    const fX1 = mirror ? x+cw-4 : x+4;
    const fX2 = mirror ? x+4    : x+cw-4;

    // Outline
    const outP = lp(fX1,y1, fX2,y2, snW+4);
    fPoly(g, outP, OUTLINE_CLR, true);
    // Corpo scuro (bordo)
    const bdP = lp(fX1,y1, fX2,y2, snW);
    fPoly(g, bdP, snDark, true);
    // Corpo brillante
    const brP = lp(fX1,y1, fX2,y2, snW*0.72);
    fPoly(g, brP, snBright, true);
    // Ventre
    const blP = lp(fX1,y1, fX2,y2, snW*0.30);
    fPoly(g, blP, snBelly, true);
    // Highlight
    const hlP = lpHL(fX1,y1, fX2,y2, snW*0.62);
    fPoly(g, hlP, snHL, true);
  }

  // === TESTA SERPENTE in cima ===
  const hcx = mirror ? x+cw*0.38 : x+cw*0.62;
  const hcy = yTop + 36;
  fCircle(g, hcx, hcy, 20, snBright);
  g.beginFill(snHL); g.drawEllipse(hcx-4, hcy-5, 12, 8);
  // Occhi verticali
  fCircle(g, hcx-7, hcy-2, 5, 0xFFCC00);
  fCircle(g, hcx+7, hcy-2, 5, 0xFFCC00);
  g.beginFill(0x080408); g.drawRect(hcx-8, hcy-6, 3, 8);
  g.beginFill(0x080408); g.drawRect(hcx+5, hcy-6, 3, 8);
  // Lingua
  g.beginFill(0xCC2020);
  const lx = mirror ? hcx-16 : hcx+16;
  const ld = mirror ? -1 : 1;
  g.drawPolygon([lx-ld*2,hcy, lx+ld*8,hcy-5, lx+ld*8,hcy+5]);
}

// ── Scena principessa Mariana ─────────────────────────────
function buildPrincessScene(g) {
  const W=800, H=500;
  // Sfondo castello
  g.beginFill(0x0E0818); g.drawRect(0,0,W,H);
  g.beginFill(0x180C28); g.drawRect(0,0,W,280);
  g.beginFill(0x241438); g.drawRect(0,60,W,140);
  // Mura in pietra
  for(let bx=0;bx<W;bx+=48){
    g.beginFill((bx/48|0)%2===0?0x1C1020:0x161020);
    g.drawRect(bx,0,24,H);
  }
  for(let by=0;by<H;by+=36){
    g.beginFill(0x100818,0.6);
    g.drawRect(0,by,W,2);
  }
  // Arco gotico di sfondo
  g.beginFill(0x080410);
  g.drawPolygon([280,400,280,180,320,120,360,100,400,92,440,100,480,120,520,180,520,400]);
  g.beginFill(0x120C1E);
  g.drawPolygon([296,400,296,188,330,136,362,116,400,108,438,116,470,136,504,188,504,400]);
  // Pavimento a scacchi
  for(let bx=0;bx<W;bx+=60){
    for(let by=390;by<H;by+=50){
      g.beginFill((bx+by)%120===0?0x201428:0x180E20);
      g.drawRect(bx,by,60,50);
    }
  }
  g.beginFill(0x381A48); g.drawRect(0,390,W,4);
  // Torce
  _torchScene(g,80,200);
  _torchScene(g,W-80,200);
  _torchScene(g,220,300);
  _torchScene(g,W-220,300);
  // Catene spezzate
  g.beginFill(0x706860);
  g.drawRect(364,374,6,18); g.drawRect(430,374,6,18);
  g.drawEllipse(367,392,10,5); g.drawEllipse(433,392,10,5);
  g.beginFill(0x908880);
  g.drawRect(365,375,3,16); g.drawRect(431,375,3,16);
  // Principessa
  _drawMarianna(g,400,390);
  // Alone luminoso
  g.beginFill(0xFFD860, 0.10); g.drawCircle(400,240,180);
}

function _torchScene(g,x,y) {
  g.beginFill(0x3A2008); g.drawRect(x-4,y,8,36);
  g.beginFill(0xFF8800); g.drawPolygon([x,y-28,x-9,y+4,x+9,y+4]);
  g.beginFill(0xFFCC00); g.drawPolygon([x,y-18,x-5,y+2,x+5,y+2]);
  g.beginFill(0xFFFF88); g.drawEllipse(x,y-8,14,20);
}

function _drawMarianna(g,cx,gY) {
  // Capelli lunghi neri
  g.beginFill(0x0A0608);
  g.drawPolygon([cx-20,gY-178,cx-28,gY-140,cx-32,gY-60,cx-18,gY-18,
                 cx-8,gY-8,cx-6,gY-78,cx-4,gY-158]);
  g.drawPolygon([cx+4,gY-158,cx+6,gY-78,cx+8,gY-8,cx+18,gY-18,
                 cx+32,gY-60,cx+28,gY-140,cx+20,gY-178]);
  // Corona dorata
  g.beginFill(0xFFCC00);
  g.drawPolygon([cx-22,gY-190,cx-18,gY-208,cx-12,gY-194,
                 cx-6,gY-214,cx,gY-198,cx+6,gY-214,
                 cx+12,gY-194,cx+18,gY-208,cx+22,gY-190]);
  g.beginFill(0xFFEE44); g.drawRect(cx-22,gY-190,44,8);
  g.beginFill(0xFF3030); g.drawCircle(cx,gY-195,5);
  g.beginFill(0x40AAFF); g.drawCircle(cx-14,gY-195,3.5);
  g.beginFill(0x40AAFF); g.drawCircle(cx+14,gY-195,3.5);
  // Testa
  g.beginFill(0x040202); g.drawEllipse(cx,gY-158,21,23);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx,gY-158,19,21);
  // Mandibola
  const jaw=[cx-13,gY-147,cx+13,gY-147,cx+9,gY-138,cx,gY-136,cx-9,gY-138];
  g.beginFill(0x040202); g.drawPolygon(expandPoly(jaw,2));
  g.beginFill(0xF8D8C0); g.drawPolygon(jaw);
  // Occhi con sclera
  g.beginFill(0x040202); g.drawEllipse(cx-7,gY-160,7,4);
  g.beginFill(0x040202); g.drawEllipse(cx+7,gY-160,7,4);
  g.beginFill(0xEEEEEE); g.drawEllipse(cx-7,gY-160,6,3);
  g.beginFill(0xEEEEEE); g.drawEllipse(cx+7,gY-160,6,3);
  g.beginFill(0x3828A0); g.drawCircle(cx-7,gY-160,2); // occhi azzurri
  g.beginFill(0x3828A0); g.drawCircle(cx+7,gY-160,2);
  g.beginFill(0xFFFFFF); g.drawCircle(cx-6,gY-161,0.8);
  g.beginFill(0xFFFFFF); g.drawCircle(cx+8,gY-161,0.8);
  // Sopracciglia sottili
  g.beginFill(0x1A0808);
  g.drawPolygon([cx-12,gY-166,cx-4,gY-168,cx-4,gY-166,cx-12,gY-165]);
  g.drawPolygon([cx+4,gY-168,cx+12,gY-166,cx+12,gY-165,cx+4,gY-166]);
  // Naso e bocca
  g.beginFill(0xE0B0A0); g.drawPolygon([cx-1,gY-155,cx+1,gY-155,cx+3,gY-151,cx-3,gY-151]);
  g.beginFill(0xCC5060); g.drawEllipse(cx,gY-145,7,3);
  g.beginFill(0xE87080); g.drawEllipse(cx,gY-144,5,2);
  // Highlights pelle
  g.beginFill(0xFFE8D8); g.drawEllipse(cx-4,gY-164,6,4);
  // Abito lungo azzurro/viola
  const gown=[cx-24,gY-136,cx+24,gY-136,cx+30,gY-90,cx+36,gY-20,cx+44,gY,
              cx-44,gY,cx-36,gY-20,cx-30,gY-90];
  g.beginFill(0x040202); g.drawPolygon(expandPoly(gown,3));
  g.beginFill(0x2838A8); g.drawPolygon(gown);
  // Highlight abito
  g.beginFill(0x3848C8);
  g.drawPolygon([cx-22,gY-134,cx-6,gY-134,cx-8,gY-50,cx-24,gY-52]);
  g.drawPolygon([cx+6,gY-134,cx+22,gY-134,cx+24,gY-52,cx+8,gY-50]);
  // Cintura dorata
  g.beginFill(0xFFCC00); g.drawRect(cx-24,gY-100,48,10);
  g.beginFill(0xFFEE44); g.drawRect(cx-22,gY-98,44,6);
  g.beginFill(0xFF4040); g.drawCircle(cx,gY-95,5); // gemma
  // Scollatura
  g.beginFill(0x2838A8);
  g.drawPolygon([cx-24,gY-136,cx,gY-124,cx+24,gY-136,cx+20,gY-144,cx,gY-132,cx-20,gY-144]);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx,gY-133,10,6);
  // Braccio sinistro aperto (gioioso)
  g.beginFill(0x040202);
  g.drawPolygon([cx-24,gY-126,cx-50,gY-105,cx-54,gY-85,cx-42,gY-80,cx-36,gY-102,cx-18,gY-118]);
  g.beginFill(0x2838A8);
  g.drawPolygon([cx-24,gY-126,cx-48,gY-106,cx-52,gY-87,cx-42,gY-82,cx-36,gY-104,cx-18,gY-120]);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx-50,gY-88,8,6);
  // Braccio destro aperto
  g.beginFill(0x040202);
  g.drawPolygon([cx+24,gY-126,cx+50,gY-105,cx+54,gY-85,cx+42,gY-80,cx+36,gY-102,cx+18,gY-118]);
  g.beginFill(0x2838A8);
  g.drawPolygon([cx+24,gY-126,cx+48,gY-106,cx+52,gY-87,cx+42,gY-82,cx+36,gY-104,cx+18,gY-120]);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx+50,gY-88,8,6);
  // Alone dorato di libertà
  g.beginFill(0xFFDD60, 0.04); g.drawCircle(cx,gY-140,95);
}

// ── Mariana incatenata (sconfitta) ────────────────────────
function buildPrisonerScene(g) {
  buildDungeonBg(g);
  const cx=400, gY=390;
  const ch=0x706860, chHL=0x908880;

  // Attacchi catena al muro
  g.beginFill(ch); g.drawCircle(155, gY-108, 7);
  g.beginFill(chHL); g.drawCircle(155, gY-108, 4);
  g.beginFill(ch); g.drawCircle(645, gY-108, 7);
  g.beginFill(chHL); g.drawCircle(645, gY-108, 4);

  // Catena sinistra (muro → polso)
  const lc = lp(155, gY-108, cx-52, gY-90, 5);
  g.beginFill(ch); g.drawPolygon(lc);
  for (let t=0.08; t<1; t+=0.16) {
    const lx = 155+(cx-52-155)*t, ly=(gY-108)+(gY-90-(gY-108))*t;
    g.beginFill(chHL); g.drawEllipse(lx,ly,6,4);
    g.beginFill(ch);   g.drawEllipse(lx,ly,4,2.5);
  }

  // Catena destra
  const rc = lp(cx+52, gY-90, 645, gY-108, 5);
  g.beginFill(ch); g.drawPolygon(rc);
  for (let t=0.08; t<1; t+=0.16) {
    const rx = cx+52+(645-(cx+52))*t, ry=(gY-90)+(gY-108-(gY-90))*t;
    g.beginFill(chHL); g.drawEllipse(rx,ry,6,4);
    g.beginFill(ch);   g.drawEllipse(rx,ry,4,2.5);
  }

  // Mariana incatenata
  _drawMariannaPrisoner(g, cx, gY);
}

function _drawMariannaPrisoner(g, cx, gY) {
  // Capelli
  g.beginFill(0x0A0608);
  g.drawPolygon([cx-20,gY-178,cx-28,gY-140,cx-32,gY-60,cx-18,gY-18,
                 cx-8,gY-8,cx-6,gY-78,cx-4,gY-158]);
  g.drawPolygon([cx+4,gY-158,cx+6,gY-78,cx+8,gY-8,cx+18,gY-18,
                 cx+32,gY-60,cx+28,gY-140,cx+20,gY-178]);
  // Corona
  g.beginFill(0xFFCC00);
  g.drawPolygon([cx-22,gY-190,cx-18,gY-208,cx-12,gY-194,
                 cx-6,gY-214,cx,gY-198,cx+6,gY-214,
                 cx+12,gY-194,cx+18,gY-208,cx+22,gY-190]);
  g.beginFill(0xFFEE44); g.drawRect(cx-22,gY-190,44,8);
  g.beginFill(0xFF3030); g.drawCircle(cx,gY-195,5);
  g.beginFill(0x40AAFF); g.drawCircle(cx-14,gY-195,3.5);
  g.beginFill(0x40AAFF); g.drawCircle(cx+14,gY-195,3.5);
  // Testa (leggermente china)
  g.beginFill(0x040202); g.drawEllipse(cx,gY-155,21,23);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx,gY-155,19,21);
  const jaw=[cx-13,gY-144,cx+13,gY-144,cx+9,gY-135,cx,gY-133,cx-9,gY-135];
  g.beginFill(0x040202); g.drawPolygon(expandPoly(jaw,2));
  g.beginFill(0xF8D8C0); g.drawPolygon(jaw);
  // Occhi (sguardo triste, abbassato)
  g.beginFill(0x040202); g.drawEllipse(cx-7,gY-158,7,4); g.drawEllipse(cx+7,gY-158,7,4);
  g.beginFill(0xEEEEEE); g.drawEllipse(cx-7,gY-158,6,3); g.drawEllipse(cx+7,gY-158,6,3);
  g.beginFill(0x3828A0); g.drawCircle(cx-7,gY-157,2); g.drawCircle(cx+7,gY-157,2); // sguardo basso
  g.beginFill(0xFFFFFF); g.drawCircle(cx-6,gY-158,0.8); g.drawCircle(cx+8,gY-158,0.8);
  // Sopracciglia inarcate (tristi)
  g.beginFill(0x1A0808);
  g.drawPolygon([cx-12,gY-165,cx-4,gY-163,cx-4,gY-161,cx-12,gY-163]); // inclinato verso il centro
  g.drawPolygon([cx+4,gY-163,cx+12,gY-165,cx+12,gY-163,cx+4,gY-161]);
  // Naso e bocca (espressione triste)
  g.beginFill(0xE0B0A0); g.drawPolygon([cx-1,gY-152,cx+1,gY-152,cx+3,gY-148,cx-3,gY-148]);
  g.beginFill(0xCC5060); // piega in giù ai lati
  g.drawPolygon([cx-7,gY-141,cx+7,gY-141,cx+5,gY-144,cx-5,gY-144]);
  g.beginFill(0xFFE8D8); g.drawEllipse(cx-4,gY-161,6,4);
  // Abito
  const gown=[cx-24,gY-136,cx+24,gY-136,cx+30,gY-90,cx+36,gY-20,cx+44,gY,
              cx-44,gY,cx-36,gY-20,cx-30,gY-90];
  g.beginFill(0x040202); g.drawPolygon(expandPoly(gown,3));
  g.beginFill(0x2838A8); g.drawPolygon(gown);
  g.beginFill(0x3848C8);
  g.drawPolygon([cx-22,gY-134,cx-6,gY-134,cx-8,gY-50,cx-24,gY-52]);
  g.drawPolygon([cx+6,gY-134,cx+22,gY-134,cx+24,gY-52,cx+8,gY-50]);
  g.beginFill(0xFFCC00); g.drawRect(cx-24,gY-100,48,10);
  g.beginFill(0xFFEE44); g.drawRect(cx-22,gY-98,44,6);
  g.beginFill(0xFF4040); g.drawCircle(cx,gY-95,5);
  g.beginFill(0x2838A8);
  g.drawPolygon([cx-24,gY-136,cx,gY-124,cx+24,gY-136,cx+20,gY-144,cx,gY-132,cx-20,gY-144]);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx,gY-133,10,6);
  // Braccia tese ai lati (tirate dalle catene)
  g.beginFill(0x040202);
  g.drawPolygon([cx-24,gY-126,cx-54,gY-104,cx-58,gY-84,cx-46,gY-80,cx-40,gY-102,cx-18,gY-118]);
  g.beginFill(0x2838A8);
  g.drawPolygon([cx-24,gY-126,cx-52,gY-106,cx-56,gY-86,cx-46,gY-82,cx-40,gY-104,cx-18,gY-120]);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx-54,gY-86,8,6);
  g.beginFill(0x040202);
  g.drawPolygon([cx+24,gY-126,cx+54,gY-104,cx+58,gY-84,cx+46,gY-80,cx+40,gY-102,cx+18,gY-118]);
  g.beginFill(0x2838A8);
  g.drawPolygon([cx+24,gY-126,cx+52,gY-106,cx+56,gY-86,cx+46,gY-82,cx+40,gY-104,cx+18,gY-120]);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx+54,gY-86,8,6);
  // Manette ai polsi
  g.beginFill(0x040202); g.drawEllipse(cx-54,gY-86,11,8);
  g.beginFill(0x706860); g.drawEllipse(cx-54,gY-86,9,6);
  g.beginFill(0x040202); g.drawEllipse(cx+54,gY-86,11,8);
  g.beginFill(0x706860); g.drawEllipse(cx+54,gY-86,9,6);
}

// ── Scena cinemática animata ──────────────────────────────

function buildDungeonBg(g) {
  const W=800,H=500;
  g.beginFill(0x0E0818); g.drawRect(0,0,W,H);
  g.beginFill(0x180C28); g.drawRect(0,0,W,280);
  g.beginFill(0x241438); g.drawRect(0,60,W,140);
  for(let bx=0;bx<W;bx+=48){
    g.beginFill((bx/48|0)%2===0?0x1C1020:0x161020); g.drawRect(bx,0,24,H);
  }
  for(let by=0;by<H;by+=36){
    g.beginFill(0x100818,0.6); g.drawRect(0,by,W,2);
  }
  g.beginFill(0x080410);
  g.drawPolygon([280,400,280,180,320,120,360,100,400,92,440,100,480,120,520,180,520,400]);
  g.beginFill(0x120C1E);
  g.drawPolygon([296,400,296,188,330,136,362,116,400,108,438,116,470,136,504,188,504,400]);
  for(let bx=0;bx<W;bx+=60){
    for(let by=390;by<H;by+=50){
      g.beginFill((bx+by)%120===0?0x201428:0x180E20); g.drawRect(bx,by,60,50);
    }
  }
  g.beginFill(0x381A48); g.drawRect(0,390,W,4);
  _torchScene(g,80,200); _torchScene(g,W-80,200);
  _torchScene(g,220,300); _torchScene(g,W-220,300);
  g.beginFill(0x706860);
  g.drawRect(364,374,6,18); g.drawRect(430,374,6,18);
  g.drawEllipse(367,392,10,5); g.drawEllipse(433,392,10,5);
  g.beginFill(0x908880);
  g.drawRect(365,375,3,16); g.drawRect(431,375,3,16);
}

function drawCinemaHero(g, walkFrame, pal) {
  const p = Object.assign({}, WALK_POSES[walkFrame % 4]);
  delete p.sword;
  drawFighter(g, p, pal);
}

function drawCinemaHeroReach(g, pal) {
  drawFighter(g, {
    head:[40,18], lArm:[20,44,10,72], rArm:[62,44,92,62],
    lLeg:[30,84,24,118], rLeg:[50,84,54,118],
  }, pal);
}

function drawCinemaMari(g, walkFrame, holdHand) {
  const cx=40, gY=118;
  const sway = (walkFrame%2===0) ? 2 : -2;

  // Capelli
  g.beginFill(0x0A0608);
  g.drawPolygon([cx-20,gY-178,cx-28,gY-140,cx-32,gY-60,cx-18,gY-18,
                 cx-8,gY-8,cx-6,gY-78,cx-4,gY-158]);
  g.drawPolygon([cx+4,gY-158,cx+6,gY-78,cx+8,gY-8,cx+18,gY-18,
                 cx+32,gY-60,cx+28,gY-140,cx+20,gY-178]);

  // Corona
  g.beginFill(0xFFCC00);
  g.drawPolygon([cx-22,gY-190,cx-18,gY-208,cx-12,gY-194,
                 cx-6,gY-214,cx,gY-198,cx+6,gY-214,
                 cx+12,gY-194,cx+18,gY-208,cx+22,gY-190]);
  g.beginFill(0xFFEE44); g.drawRect(cx-22,gY-190,44,8);
  g.beginFill(0xFF3030); g.drawCircle(cx,gY-195,5);
  g.beginFill(0x40AAFF); g.drawCircle(cx-14,gY-195,3.5);
  g.beginFill(0x40AAFF); g.drawCircle(cx+14,gY-195,3.5);

  // Testa
  g.beginFill(0x040202); g.drawEllipse(cx,gY-158,21,23);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx,gY-158,19,21);
  const jaw=[cx-13,gY-147,cx+13,gY-147,cx+9,gY-138,cx,gY-136,cx-9,gY-138];
  g.beginFill(0x040202); g.drawPolygon(expandPoly(jaw,2));
  g.beginFill(0xF8D8C0); g.drawPolygon(jaw);

  // Occhi
  g.beginFill(0x040202); g.drawEllipse(cx-7,gY-160,7,4); g.drawEllipse(cx+7,gY-160,7,4);
  g.beginFill(0xEEEEEE); g.drawEllipse(cx-7,gY-160,6,3); g.drawEllipse(cx+7,gY-160,6,3);
  g.beginFill(0x3828A0); g.drawCircle(cx-7,gY-160,2); g.drawCircle(cx+7,gY-160,2);
  g.beginFill(0xFFFFFF); g.drawCircle(cx-6,gY-161,0.8); g.drawCircle(cx+8,gY-161,0.8);

  // Sopracciglia
  g.beginFill(0x1A0808);
  g.drawPolygon([cx-12,gY-166,cx-4,gY-168,cx-4,gY-166,cx-12,gY-165]);
  g.drawPolygon([cx+4,gY-168,cx+12,gY-166,cx+12,gY-165,cx+4,gY-166]);

  // Naso e bocca
  g.beginFill(0xE0B0A0); g.drawPolygon([cx-1,gY-155,cx+1,gY-155,cx+3,gY-151,cx-3,gY-151]);
  g.beginFill(0xCC5060); g.drawEllipse(cx,gY-145,7,3);
  g.beginFill(0xE87080); g.drawEllipse(cx,gY-144,5,2);
  g.beginFill(0xFFE8D8); g.drawEllipse(cx-4,gY-164,6,4);

  // Veste (con oscillazione cammino)
  const gown=[cx-24+sway,gY-136,cx+24+sway,gY-136,
              cx+30+sway,gY-90,cx+36,gY-20,cx+40,gY,
              cx-40,gY,cx-36,gY-20,cx-30+sway,gY-90];
  g.beginFill(0x040202); g.drawPolygon(expandPoly(gown,3));
  g.beginFill(0x2838A8); g.drawPolygon(gown);
  g.beginFill(0x3848C8);
  g.drawPolygon([cx-22+sway,gY-134,cx-6+sway,gY-134,cx-8,gY-50,cx-24,gY-52]);
  g.drawPolygon([cx+6+sway,gY-134,cx+22+sway,gY-134,cx+24,gY-52,cx+8,gY-50]);

  // Cintura
  g.beginFill(0xFFCC00); g.drawRect(cx-24+sway,gY-100,48,10);
  g.beginFill(0xFFEE44); g.drawRect(cx-22+sway,gY-98,44,6);
  g.beginFill(0xFF4040); g.drawCircle(cx+sway,gY-95,5);

  // Scollatura
  g.beginFill(0x2838A8);
  g.drawPolygon([cx-24+sway,gY-136,cx,gY-124,cx+24+sway,gY-136,
                 cx+20+sway,gY-144,cx,gY-132,cx-20+sway,gY-144]);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx,gY-133,10,6);

  // Piedi da sotto la veste
  const fOff = (walkFrame%2===0) ? 7 : -7;
  g.beginFill(0x040202); g.drawEllipse(cx+fOff,gY-1,8,4);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx+fOff,gY-2,6,3);
  g.beginFill(0x040202); g.drawEllipse(cx-fOff,gY,7,3.5);
  g.beginFill(0xF8D8C0); g.drawEllipse(cx-fOff,gY-1,5.5,2.5);

  // Braccia
  if (holdHand) {
    // Braccio sinistro teso verso l'eroe
    g.beginFill(0x040202);
    g.drawPolygon([cx-24,gY-126,cx-52,gY-108,cx-56,gY-88,cx-44,gY-84,cx-38,gY-106,cx-18,gY-120]);
    g.beginFill(0x2838A8);
    g.drawPolygon([cx-24,gY-126,cx-50,gY-110,cx-54,gY-90,cx-44,gY-86,cx-38,gY-108,cx-18,gY-122]);
    g.beginFill(0xF8D8C0); g.drawEllipse(cx-52,gY-90,8,6);
    // Braccio destro abbassato
    g.beginFill(0x040202);
    g.drawPolygon([cx+24,gY-126,cx+42,gY-110,cx+44,gY-90,cx+34,gY-86,cx+30,gY-108,cx+18,gY-122]);
    g.beginFill(0x2838A8);
    g.drawPolygon([cx+24,gY-126,cx+40,gY-112,cx+42,gY-92,cx+34,gY-88,cx+30,gY-110,cx+18,gY-124]);
    g.beginFill(0xF8D8C0); g.drawEllipse(cx+42,gY-92,7,5);
  } else {
    // Braccia aperte (gioiosa)
    g.beginFill(0x040202);
    g.drawPolygon([cx-24,gY-126,cx-50,gY-105,cx-54,gY-85,cx-42,gY-80,cx-36,gY-102,cx-18,gY-118]);
    g.beginFill(0x2838A8);
    g.drawPolygon([cx-24,gY-126,cx-48,gY-106,cx-52,gY-87,cx-42,gY-82,cx-36,gY-104,cx-18,gY-120]);
    g.beginFill(0xF8D8C0); g.drawEllipse(cx-50,gY-88,8,6);
    g.beginFill(0x040202);
    g.drawPolygon([cx+24,gY-126,cx+50,gY-105,cx+54,gY-85,cx+42,gY-80,cx+36,gY-102,cx+18,gY-118]);
    g.beginFill(0x2838A8);
    g.drawPolygon([cx+24,gY-126,cx+48,gY-106,cx+52,gY-87,cx+42,gY-82,cx+36,gY-104,cx+18,gY-120]);
    g.beginFill(0xF8D8C0); g.drawEllipse(cx+50,gY-88,8,6);
  }
}
