import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-8">Termos de Uso</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Definições e Natureza do Serviço</h2>
              <p>
                O Xegai Shop é uma plataforma de comércio eletrônico que atua como intermediário e revendedor, 
                conectando consumidores a produtos de fornecedores terceiros. Importante destacar que os produtos 
                comercializados em nossa plataforma são enviados diretamente pelos fornecedores originais.
              </p>
              <p>
                Ao realizar uma compra, você concorda que o cumprimento do pedido será executado por nossos 
                parceiros fornecedores, e que sua compra está sujeita aos termos de uso das APIs e políticas 
                desses fornecedores, sem prejuízo dos direitos garantidos pela legislação brasileira.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Aceite dos Termos</h2>
              <p>
                Ao acessar e utilizar o site do Xegai Shop, você concorda integralmente com estes Termos de Uso. 
                Caso não concorde com qualquer disposição, solicitamos que não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Cadastro e Responsabilidades do Usuário</h2>
              <p>
                Para realizar compras, é necessário criar uma conta fornecendo informações verdadeiras e atualizadas. 
                Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas 
                em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Produtos e Preços</h2>
              <p>
                Os produtos exibidos em nossa plataforma são fornecidos por parceiros terceiros. Nos esforçamos para 
                manter informações precisas sobre disponibilidade, preços e descrições, mas não podemos garantir 
                100% de precisão devido à natureza dinâmica dos dados de nossos fornecedores.
              </p>
              <p>
                Os preços estão sujeitos a alterações sem aviso prévio, e a confirmação do pedido será realizada 
                com base no preço vigente no momento da compra.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Pedidos e Pagamentos</h2>
              <p>
                Todos os pedidos estão sujeitos à confirmação de disponibilidade e aprovação de pagamento. 
                Reservamo-nos o direito de cancelar pedidos em caso de indisponibilidade do produto ou 
                problemas com o pagamento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Entrega e Fulfillment</h2>
              <p>
                A entrega dos produtos é realizada diretamente pelos nossos fornecedores parceiros. Os prazos 
                de entrega são estimativas e podem variar conforme a localização e disponibilidade do fornecedor.
              </p>
              <p>
                O Xegai Shop atua como facilitador no processo de entrega, mas a execução física é de 
                responsabilidade do fornecedor original.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitação de Responsabilidade</h2>
              <p>
                O Xegai Shop não se responsabiliza por danos indiretos, consequenciais ou incidentais 
                decorrentes do uso de nossos serviços. Nossa responsabilidade está limitada ao valor do 
                produto adquirido.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo do site, incluindo textos, imagens, logos e design, é protegido por direitos 
                autorais e outras leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Alterações nos Termos</h2>
              <p>
                Estes termos podem ser atualizados periodicamente. As alterações entrarão em vigor imediatamente 
                após a publicação no site. Recomendamos a revisão periódica destes termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Lei Aplicável e Foro</h2>
              <p>
                Estes termos são regidos pela legislação brasileira. Qualquer controvérsia será resolvida no 
                foro da comarca do domicílio do consumidor, conforme determina o Código de Defesa do Consumidor.
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Para dúvidas ou esclarecimentos sobre estes termos, entre em contato conosco através dos 
                canais de atendimento disponíveis em nosso site.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;