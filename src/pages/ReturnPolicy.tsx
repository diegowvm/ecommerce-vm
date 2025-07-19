import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-8">Política de Devolução</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Compromisso com a Satisfação</h2>
              <p>
                O Xegai Shop está comprometido com a satisfação de nossos clientes e oferece uma política 
                de devolução transparente e justa, atuando como facilitador no processo entre você e nossos 
                fornecedores parceiros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Natureza da Operação de Devolução</h2>
              <p>
                <strong>Importante:</strong> Como o Xegai Shop atua como intermediário entre consumidores e 
                fornecedores, as políticas de devolução podem variar ligeiramente dependendo do fornecedor 
                original do produto. No entanto, garantimos que todas as devoluções respeitarão os direitos 
                mínimos estabelecidos pelo Código de Defesa do Consumidor.
              </p>
              <p>
                O Xegai Shop atuará como facilitador em todo o processo de devolução, coordenando com o 
                fornecedor original para garantir que sua solicitação seja atendida adequadamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Prazo para Solicitação</h2>
              <p><strong>Arrependimento (CDC Art. 49):</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>7 dias corridos a partir do recebimento do produto</li>
                <li>Não é necessário justificar o motivo</li>
                <li>Aplicável apenas para compras online</li>
              </ul>
              
              <p><strong>Vício ou Defeito (CDC Art. 26):</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>30 dias para produtos não duráveis</li>
                <li>90 dias para produtos duráveis</li>
                <li>Prazo conta a partir da descoberta do defeito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Condições para Devolução</h2>
              <p>Para que a devolução seja aceita, o produto deve:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Estar em sua embalagem original, sem violação</li>
                <li>Manter todas as etiquetas, lacres e acessórios</li>
                <li>Não apresentar sinais de uso além do necessário para avaliação</li>
                <li>Estar acompanhado da nota fiscal</li>
                <li>Não ser um produto de higiene pessoal, alimentos perecíveis ou itens personalizados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Processo de Devolução</h2>
              <ol className="list-decimal pl-6 space-y-3">
                <li>
                  <strong>Solicitação:</strong> Entre em contato através de nossa área do cliente ou 
                  central de atendimento informando o número do pedido e motivo da devolução
                </li>
                <li>
                  <strong>Análise:</strong> Nossa equipe analisará a solicitação e coordenará com o 
                  fornecedor original dentro de 2 dias úteis
                </li>
                <li>
                  <strong>Autorização:</strong> Após aprovação, você receberá instruções detalhadas 
                  sobre como proceder com a devolução
                </li>
                <li>
                  <strong>Coleta/Envio:</strong> Dependendo do fornecedor, organizaremos a coleta 
                  ou forneceremos etiqueta de postagem gratuita
                </li>
                <li>
                  <strong>Análise do Produto:</strong> O fornecedor analisará o produto recebido 
                  para confirmar as condições de devolução
                </li>
                <li>
                  <strong>Processamento:</strong> Aprovada a devolução, o reembolso será processado 
                  conforme descrito abaixo
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Prazos de Reembolso</h2>
              <p>Os prazos para reembolso variam conforme a forma de pagamento:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cartão de crédito:</strong> até 2 faturas subsequentes</li>
                <li><strong>PIX:</strong> até 5 dias úteis</li>
                <li><strong>Boleto bancário:</strong> até 10 dias úteis (via PIX)</li>
              </ul>
              <p>
                Os prazos começam a contar a partir da confirmação da devolução pelo fornecedor.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Custos de Devolução</h2>
              <p><strong>Direito de Arrependimento:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Frete de retorno gratuito se oferecermos coleta</li>
                <li>Caso contrário, custo do frete fica por conta do cliente</li>
              </ul>
              
              <p><strong>Produto com Defeito/Vício:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Todos os custos por nossa conta</li>
                <li>Organizamos coleta gratuita ou fornecemos etiqueta pré-paga</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Troca de Produtos</h2>
              <p>
                Oferecemos troca por tamanho ou cor diferente, sujeita à disponibilidade no estoque 
                do fornecedor. A solicitação de troca segue o mesmo processo da devolução, e eventuais 
                diferenças de preço serão cobradas ou reembolsadas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Produtos Não Aceitos para Devolução</h2>
              <p>Não aceitamos devolução de:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Produtos de higiene pessoal já utilizados</li>
                <li>Produtos com prazo de validade vencido</li>
                <li>Produtos personalizados ou sob encomenda</li>
                <li>Produtos que por sua natureza não podem ser devolvidos por questões de saúde</li>
                <li>Produtos danificados por mau uso do consumidor</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Garantia Legal</h2>
              <p>
                Todos os produtos possuem garantia legal conforme estabelecido no Código de Defesa do 
                Consumidor, independentemente da política específica do fornecedor:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>30 dias para produtos não duráveis</li>
                <li>90 dias para produtos duráveis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. Política Específica por Fornecedor</h2>
              <p>
                Embora mantenhamos padrões mínimos em linha com a legislação brasileira, alguns fornecedores 
                podem oferecer condições mais favoráveis. Informações específicas sobre a política do 
                fornecedor do seu produto serão fornecidas durante o processo de devolução.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Resolução de Conflitos</h2>
              <p>
                Caso haja divergências no processo de devolução, o Xegai Shop atuará como mediador 
                entre você e o fornecedor, sempre priorizando os direitos do consumidor estabelecidos 
                pela legislação brasileira.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Canais de Atendimento</h2>
              <p>Para solicitar devolução ou esclarecer dúvidas:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Área do Cliente no site</li>
                <li>E-mail: devolucoes@xegaioutlet.com.br</li>
                <li>WhatsApp: (11) 99999-9999</li>
                <li>Central de Atendimento: 0800 123 4567</li>
              </ul>
              <p>Horário de atendimento: Segunda a sexta, das 8h às 18h</p>
            </section>

            <section className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Esta política está em conformidade com o Código de Defesa do Consumidor (Lei 8.078/90) e 
                demais legislações aplicáveis.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnPolicy;