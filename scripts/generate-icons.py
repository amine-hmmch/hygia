"""Génère les icônes de l'application (marque Hygia). Usage : python3 scripts/generate-icons.py"""
from PIL import Image, ImageDraw
import os
PINE=(31,90,67,255); WHITE=(255,255,255,255)
def mark(size, maskable=False):
    S=size*4
    img=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(img)
    if maskable: d.rectangle([0,0,S,S],fill=PINE); scale=0.62
    else: d.rounded_rectangle([0,0,S-1,S-1],radius=int(S*0.22),fill=PINE); scale=0.78
    u=S*scale/32; ox=(S-32*u)/2; oy=(S-32*u)/2
    def X(v): return ox+v*u
    def Y(v): return oy+v*u
    w=2.6*u
    d.rectangle([X(10)-w/2,Y(8),X(10)+w/2,Y(24)],fill=WHITE)       # montant gauche
    d.rectangle([X(22)-w/2,Y(14),X(22)+w/2,Y(24)],fill=WHITE)      # montant droit
    d.rectangle([X(10),Y(16)-w/2,X(22),Y(16)+w/2],fill=WHITE)      # barre
    r=2.1*u; d.ellipse([X(22)-r,Y(9.2)-r,X(22)+r,Y(9.2)+r],fill=WHITE)  # goutte
    return img.resize((size,size),Image.LANCZOS)
out=os.path.join(os.path.dirname(__file__),'..','public')
mark(192).save(os.path.join(out,'pwa-192x192.png'))
mark(512).save(os.path.join(out,'pwa-512x512.png'))
mark(512,True).save(os.path.join(out,'pwa-maskable-512x512.png'))
mark(180,True).save(os.path.join(out,'apple-touch-icon.png'))
open(os.path.join(out,'icon.svg'),'w').write('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="7" fill="#1F5A43"/><path d="M10 8v16M22 14v10M10 16h12" stroke="#fff" stroke-width="2.6" stroke-linecap="square"/><circle cx="22" cy="9.2" r="2.1" fill="#fff"/></svg>
''')
print('ok')
