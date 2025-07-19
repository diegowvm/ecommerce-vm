import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidade</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Compromisso com a Privacidade</h2>
              <p>
                O Xegai Shop está comprometido com a proteção da privacidade e dos dados pessoais de nossos 
                usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e 
                demais regulamentações aplicáveis, incluindo o GDPR para usuários europeus.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Dados Coletados</h2>
              <p>Coletamos os seguintes tipos de dados:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de cadastro:</strong> nome, e-mail, telefone, CPF</li>
                <li><strong>Dados de endereço:</strong> endereço completo para entrega</li>
                <li><strong>Dados de pagamento:</strong> informações de cartão (processadas por terceiros seguros)</li>
                <li><strong>Dados de navegação:</strong> cookies, logs de acesso, preferências</li>
                <li><strong>Dados de interação:</strong> histórico de compras, avaliações, wishlist</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Finalidade do Tratamento</h2>
              <p>Utilizamos seus dados para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processar e gerenciar pedidos</li>
                <li>Comunicar sobre status de pedidos e entregas</li>
                <li>Melhorar a experiência de navegação e personalizar ofertas</li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                <li>Enviar comunicações promocionais (com seu consentimento)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compartilhamento com Fornecedores</h2>
              <p>
                <strong>Importante:</strong> Para viabilizar o fulfillment dos pedidos, compartilhamos seus dados 
                com nossos fornecedores parceiros, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nome completo e dados de contato</li>
                <li>Endereço de entrega completo</li>
                <li>Informações do produto adquirido</li>
                <li>Dados necessários para emissão de nota fiscal</li>
              </ul>
              <p>
                Ao realizar uma compra, você consente expressamente com o compartilhamento desses dados para 
                fins de cumprimento do pedido. Nossos fornecedores são obrigados contratualmente a proteger 
                seus dados e utilizá-los apenas para a finalidade específica de entrega do produto.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Base Legal para o Tratamento</h2>
              <p>O tratamento de seus dados é baseado em:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Consentimento:</strong> para comunicações promocionais e cookies não essenciais</li>
                <li><strong>Execução de contrato:</strong> para processamento de pedidos</li>
                <li><strong>Cumprimento de obrigação legal:</strong> para emissão de notas fiscais</li>
                <li><strong>Interesse legítimo:</strong> para prevenção de fraudes e melhorias no serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Seus Direitos (LGPD/GDPR)</h2>
              <p>Você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acesso:</strong> solicitar informações sobre o tratamento de seus dados</li>
                <li><strong>Retificação:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Eliminação:</strong> excluir dados desnecessários ou tratados em desconformidade</li>
                <li><strong>Portabilidade:</strong> solicitar a transferência de seus dados</li>
                <li><strong>Oposição:</strong> opor-se ao tratamento baseado em interesse legítimo</li>
                <li><strong>Revogação do consentimento:</strong> retirar consentimento a qualquer momento</li>
                <li><strong>Informação sobre compartilhamento:</strong> saber com quem seus dados são compartilhados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cookies e Tecnologias Similares</h2>
              <p>
                Utilizamos cookies para melhorar sua experiência de navegação. Você pode gerenciar suas 
                preferências de cookies através do banner de consentimento ou nas configurações do seu navegador.
              </p>
              <p>
                Utilizamos cookies essenciais (necessários para o funcionamento do site), de performance 
                (para análise de uso) e de marketing (para personalização de anúncios).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Segurança dos Dados</h2>
              <p>
                Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados contra 
                acesso não autorizado, alteração, divulgação ou destruição, incluindo criptografia, 
                controles de acesso e monitoramento contínuo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Retenção de Dados</h2>
              <p>
                Mantemos seus dados pelo tempo necessário para cumprir as finalidades para as quais foram 
                coletados, respeitando os prazos legais aplicáveis. Dados de pedidos são mantidos por 5 anos 
                para fins fiscais e contábeis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Transferência Internacional</h2>
              <p>
                Alguns de nossos fornecedores e serviços podem estar localizados fora do Brasil. Nesses casos, 
                garantimos que a transferência seja realizada em conformidade com a LGPD e mediante adequadas 
                salvaguardas contratuais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Menores de Idade</h2>
              <p>
                Nossos serviços não são direcionados a menores de 18 anos. Caso identifiquemos dados de menores 
                coletados sem consentimento dos responsáveis, procederemos à exclusão imediata.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Alterações na Política</h2>
              <p>
                Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas 
                por e-mail ou através de avisos em nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Encarregado de Dados (DPO)</h2>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, entre em contato 
                com nosso Encarregado de Dados através do e-mail: privacidade@xegaioutlet.com.br
              </p>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Esta política está em conformidade com a LGPD (Lei 13.709/2018) e GDPR (Regulamento 2016/679).
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;