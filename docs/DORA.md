# Métricas DORA — FilaFácil

As métricas DORA (DevOps Research and Assessment) servem para medir a saúde do processo de entrega de software. São quatro no total: frequência de deploy, lead time de mudanças, taxa de falha de mudanças e tempo de restauração de serviço.

Neste projeto documentamos as duas primeiras, que são as que conseguimos medir de forma confiável com os dados que o GitHub Actions e o Git já produzem. As outras duas dependem de dados de incidente em produção que o projeto ainda não gera, e estão explicadas no final.

## 1. Frequência de Deploy

Mede com que frequência o time coloca código novo em produção. Quanto mais frequente e menor cada entrega, menor o risco de cada deploy.

Como medimos no FilaFácil:

Cada push na branch main que passa por todo o pipeline dispara um deploy automático no Render, através do job "Deploy to Render" no GitHub Actions. Ou seja, a frequência de deploy é o número de execuções bem-sucedidas desse job em um período.

Onde ver os dados:

1. Aba Actions do repositório, filtrando pelo workflow CI/CD e olhando o job Deploy to Render.
2. Histórico de deploys no painel do serviço no Render (Events).

Leitura esperada para este projeto: ao menos um deploy por funcionalidade entregue. Times de alta performance, segundo o relatório DORA, fazem múltiplos deploys por dia. Para um projeto acadêmico individual, um ritmo saudável é um deploy a cada item concluído no Kanban.

## 2. Lead Time for Changes

Mede o tempo entre um commit ser feito e esse mesmo código estar rodando em produção. É o tempo que uma mudança leva para sair da máquina do desenvolvedor e chegar ao usuário.

Como medimos no FilaFácil:

Pegamos o horário do commit (visível no git log ou na interface do GitHub) e o horário de conclusão do run do pipeline que publicou esse commit. A diferença entre os dois é o lead time daquela mudança.

Como calcular na prática:

1. Rode `git log -1 --format=%cd <commit>` para obter o horário do commit.
2. Abra o run correspondente na aba Actions e veja o horário em que o job Deploy to Render terminou.
3. Subtraia um do outro.

Leitura esperada para este projeto: como o pipeline roda testes, build das imagens Docker e deploy em sequência, o lead time é praticamente o tempo total do pipeline, algo entre poucos minutos. Esse número curto é justamente um dos objetivos de ter CI/CD automatizado.

## Por que não documentamos as outras duas

A taxa de falha de mudanças (quantos deploys causam problema em produção) e o tempo de restauração de serviço (quanto tempo leva para se recuperar de uma falha) dependem de registrar incidentes reais em produção. O FilaFácil ainda não tem usuários nem monitoramento de incidentes, então qualquer número aqui seria inventado. Quando o projeto tiver uso real e um registro de incidentes, essas duas métricas entram na documentação.
