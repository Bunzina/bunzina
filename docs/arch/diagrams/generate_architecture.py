"""Render architecture diagrams using Python 3 and system librsvg/Cairo (Linux/WSL)."""
from pathlib import Path
import ctypes as C
import ctypes.util
import html

OUT = Path(__file__).resolve().parents[1]
class Diagram:
    def __init__(self, width, height, title, subtitle):
        self.width, self.height = width, height
        self.parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
            '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#405574"/></marker></defs>',
            '<style>text{font-family:DejaVu Sans,sans-serif;fill:#17253c}</style>',
            f'<rect width="{width}" height="{height}" fill="#f7f9fc"/>']
        self.text(65,72,title,36,bold=True)
        self.text(65,115,subtitle,21,color='#61728b')
    def text(self,x,y,value,size=21,color='#17253c',bold=False,anchor='start'):
        self.parts.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" style="fill:{color}" font-weight="{700 if bold else 400}" text-anchor="{anchor}">{html.escape(value)}</text>')
    def rect(self,x,y,w,h,fill='#ffffff',stroke='#d1dae8',dash=False):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{stroke}" stroke-width="2"'+(' stroke-dasharray="10 7"' if dash else '')+'/>')
    def box(self,x,y,w,h,title,lines=(),color='#2563eb'):
        self.rect(x,y,w,h)
        self.parts.append(f'<path d="M{x+12},{y} H{x+w-12} Q{x+w},{y} {x+w},{y+12} V{y+49} H{x} V{y+12} Q{x},{y} {x+12},{y}" fill="{color}"/>')
        self.text(x+18,y+33,title,23,color='white',bold=True)
        for i,line in enumerate(lines): self.text(x+18,y+81+31*i,line,20)
    def line(self,points,dash=False,arrow=True,color='#405574'):
        path='M'+' L'.join(f'{x},{y}' for x,y in points)
        self.parts.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="2.5" stroke-linejoin="round"'+(' stroke-dasharray="9 7"' if dash else '')+(' marker-end="url(#arrow)"' if arrow else '')+'/>')
    def message(self,a,b,y,label,reply=False):
        self.line([(a,y),(b,y)],dash=reply)
        self.text((a+b)/2,y-13,label,21,anchor='middle')
    def save(self,name):
        svg=OUT/(name+'.svg')
        svg.write_text('\n'.join(self.parts+['</svg>'])+'\n')
        render(svg,OUT/(name+'.png'),self.width,self.height)


def render(svg,png,width,height):
    rsvg=C.CDLL(ctypes.util.find_library('rsvg-2'))
    cairo=C.CDLL(ctypes.util.find_library('cairo'))
    obj=C.CDLL(ctypes.util.find_library('gobject-2.0'))
    rsvg.rsvg_handle_new_from_file.argtypes=[C.c_char_p,C.POINTER(C.c_void_p)]
    rsvg.rsvg_handle_new_from_file.restype=C.c_void_p
    rsvg.rsvg_handle_render_cairo.argtypes=[C.c_void_p,C.c_void_p]
    rsvg.rsvg_handle_render_cairo.restype=C.c_int
    cairo.cairo_image_surface_create.argtypes=[C.c_int,C.c_int,C.c_int]
    cairo.cairo_image_surface_create.restype=C.c_void_p
    cairo.cairo_create.argtypes=[C.c_void_p]
    cairo.cairo_create.restype=C.c_void_p
    cairo.cairo_surface_write_to_png.argtypes=[C.c_void_p,C.c_char_p]
    cairo.cairo_surface_write_to_png.restype=C.c_int
    cairo.cairo_destroy.argtypes=[C.c_void_p]
    cairo.cairo_surface_destroy.argtypes=[C.c_void_p]
    obj.g_object_unref.argtypes=[C.c_void_p]
    error=C.c_void_p()
    handle=rsvg.rsvg_handle_new_from_file(str(svg).encode(),C.byref(error))
    assert handle, 'SVG loading failed'
    surface=cairo.cairo_image_surface_create(0,width,height)
    ctx=cairo.cairo_create(surface)
    assert rsvg.rsvg_handle_render_cairo(handle,ctx), 'SVG rendering failed'
    assert cairo.cairo_surface_write_to_png(surface,str(png).encode()) == 0
    cairo.cairo_destroy(ctx)
    cairo.cairo_surface_destroy(surface)
    obj.g_object_unref(handle)
    print(f'Generated {svg.name} and {png.name} ({width} x {height})')


def sequence():
    d=Diagram(2360,1510,'BUNZINA / ABERTURA DA ORDEM DE SERVIÇO','Fluxo de sucesso · POST /service-orders · autenticação na API · persistência transacional')
    xs=[210,695,1180,1665,2150]
    titles=['Solicitante','API / entrada HTTP','Caso de uso','Persistência / consultas','PostgreSQL']
    details=[['Requisição autenticada'],['Middleware + handler','CreateServiceOrderInput'],['CreateServiceOrderUseCase'],['FindById + repositórios'],['Schema bunzina']]
    for x,title,lines in zip(xs,titles,details):
        d.box(x-185,175,370,126,title,lines,color='#6d28d9' if x==1180 else '#2563eb')
        d.line([(x,301),(x,1450)],dash=True,arrow=False,color='#a5b2c5')
    c,a,u,r,b=xs
    d.message(c,a,370,'1. POST /service-orders + Bearer JWT')
    d.rect(a-190,407,380,86,'#eaf1ff')
    d.text(a,441,'2. Autentica e valida o body',21,bold=True,anchor='middle')
    d.text(a,472,'UUIDs + pelo menos um item',19,anchor='middle')
    d.message(a,u,545,'3. execute(input validado)')
    d.message(u,r,615,'4. Verifica as referências por ID')
    d.message(r,b,680,'5. SELECTs via repositórios')
    d.rect(1480,712,820,80,'#edf2f9')
    d.text(1500,742,'Cliente → veículo → serviços → peças',20,bold=True)
    d.text(1500,773,'Consultas sequenciais; IDs de catálogo sem duplicação.',19)
    d.message(b,r,835,'6. Registros encontrados',reply=True)
    d.message(r,u,900,'7. Entidades existentes',reply=True)
    d.rect(u-215,930,430,120,'#f0eafb')
    d.text(u,965,'8. Monta itens e calcula totais',22,bold=True,anchor='middle')
    d.text(u,998,'Usa price / unitPrice do request',19,anchor='middle')
    d.text(u,1027,'Cria a OS em RECEIVED',21,anchor='middle')
    d.message(u,r,1100,'9. repository.create(OS)')
    d.message(r,b,1170,'10. Transação: INSERT da OS e itens')
    d.message(b,r,1240,'11. COMMIT concluído',reply=True)
    d.message(r,u,1300,'12. Persistência concluída',reply=True)
    d.message(u,a,1360,'13. Retorna ServiceOrder',reply=True)
    d.message(a,c,1420,'14. Presenter → HTTP 201 + OS',reply=True)
    d.save('sequence-service-order')


def eks():
    d=Diagram(2400,1625,'BUNZINA / EKS — REDE E RECURSOS DA APLICAÇÃO','Arquitetura em Terraform e Helm')
    d.rect(450,165,1890,1120,'#f1f6fc','#9eb3ce')
    d.text(480,205,'AWS / VPC 10.0.0.0/16 · us-east-1a e us-east-1b (valores padrão)',24,bold=True)
    d.rect(490,240,470,840,'#fff7ed','#e6b980',True)
    d.text(515,283,'Subnets públicas',24,bold=True)
    d.rect(1020,240,1270,965,'#eef4ff','#9bb7e3',True)
    d.text(1050,281,'EKS / nós em subnets privadas',26,bold=True)
    d.text(1050,318,'Node group: t3.medium · desejado 2 · mínimo 1 / máximo 4',20)
    d.text(1050,353,'Namespace bunzina',22,bold=True,color='#6d28d9')
    d.box(65,415,320,125,'Solicitante',['Rotas da API'],color='#64748b')
    d.box(530,415,390,160,'ALB público',['HTTP :80','target-type: ip','Health check /health'],color='#c26b12')
    d.box(1090,445,430,154,'Ingress + Service',['IngressClass: alb','Backend: bunzina:80','ClusterIP → targetPort :3000'])
    d.box(1650,415,570,171,'Deployment / pods bunzina',['API Bun + Elysia · porta 3000','Middleware de autenticação na API','Readiness / liveness: GET /health'],color='#6d28d9')
    d.line([(385,478),(530,478)])
    d.line([(920,440),(985,440),(985,380),(1940,380),(1940,415)])
    d.text(1440,402,'Tráfego HTTP → IP dos pods :3000',20,anchor='middle')
    d.line([(1520,525),(1650,525)],dash=True)
    d.text(1585,511,'backend',16,anchor='middle')
    d.text(1110,636,'Ingress / Service definem o backend lógico.',19,color='#61728b')
    d.text(1110,665,'Com target-type: ip, ALB alcança os pods diretamente.',19,color='#61728b')
    d.box(1090,720,430,135,'HPA',['2–10 réplicas de pods','Alvo: 70% de CPU'],color='#0e7490')
    d.box(1650,720,570,135,'ConfigMap + Secret',['envFrom no Deployment','Configuração e credenciais em variáveis'],color='#64748b')
    d.line([(1520,785),(1585,785),(1585,690),(1810,690),(1810,586)],dash=True)
    d.text(1598,706,'escala',17)
    d.line([(2000,720),(2000,586)],dash=True)
    d.text(2015,654,'env',18)
    d.box(1090,975,470,172,'PostgreSQL in-cluster (opcional)',['Service postgres:5432 + StatefulSet','PostgreSQL 15 · PVC gp3 / 10Gi','Deploy sem DB_HOST usa este banco'],color='#0e7490')
    d.line([(2220,558),(2255,558),(2255,920),(1320,920),(1320,975)],dash=True)
    d.text(1790,908,'Conexão local quando habilitado',19,anchor='middle')
    d.text(1640,1020,'Addons declarados em Terraform:',21,bold=True)
    d.text(1640,1057,'vpc-cni · kube-proxy · coredns',21)
    d.text(1640,1094,'aws-ebs-csi-driver · StorageClass gp3',21)
    d.text(515,705,'ALB recebe as requisições.',21,bold=True)
    d.text(515,744,'NAT é usado na saída',21)
    d.text(515,777,'das subnets privadas.',21)
    d.text(515,850,'Login serverless:',21,bold=True)
    d.text(515,889,'POST /auth/login',21)
    d.text(515,922,'API Gateway → Lambda → API',19)
    d.text(515,955,'Fluxo separado deste desenho.',18,color='#61728b')
    d.text(480,1248,'Linhas contínuas: tráfego HTTP. Tracejadas: configuração, controle ou conexão condicional com o banco local.',20,color='#61728b')
    d.text(65,1350,'SAÍDA DAS SUBNETS PRIVADAS — CAMINHO SEPARADO DO TRÁFEGO DE ENTRADA',24,bold=True)
    d.box(65,1400,440,130,'Nós / pods',['Pull de imagem pelos nós','Conexões externas da aplicação'])
    d.box(645,1400,395,130,'NAT Gateway',['1 NAT · subnet pública','single_nat_gateway = true'],color='#c26b12')
    d.box(1180,1400,300,130,'Internet Gateway',['Saída da VPC'],color='#c26b12')
    d.box(1640,1400,690,165,'Destinos externos',['ECR: download da imagem da aplicação','Banco público externo: host definido por DB_HOST','Se DB_HOST for definido, deploy desativa o banco local'],color='#64748b')
    d.line([(505,1460),(645,1460)])
    d.line([(1040,1460),(1180,1460)])
    d.line([(1480,1460),(1640,1460)])
    d.save('eks')

if __name__ == '__main__':
    sequence()
    eks()
