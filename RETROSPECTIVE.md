# Retrospectiva da Sprint 1

Essa foi a sprint de fundação. O objetivo era sair do zero e ter alguma coisa de concreto rodando: proposta aprovada, Kanban montado no GitHub Projects e pelo menos o esqueleto do backend funcionando. No geral saí satisfeito com o que entreguei, mas tem algumas coisas que quero registrar aqui para não repetir nas próximas sprints.

## O que foi entregue

Fechei três itens no Kanban. O primeiro foi o backend inicial em Node, Express e TypeScript, com a estrutura separada em controllers, services, rotas e testes. Em cima disso implementei o endpoint de gerar senha e a listagem básica da fila, ambos com testes unitários no service e testes de integração nas rotas usando Vitest e supertest. No final da sprint são nove testes rodando em menos de meio segundo.

A issue de criar a estrutura do banco ficou em In Progress. Não terminei, mas avancei na parte de desenho: defini que tickets vão precisar ser persistidos (e não descartáveis, como eu pensei no começo) e que o MVP provavelmente não precisa de tabela de usuários ainda. A decisão entre Supabase e Postgres puro é o que trava a implementação.

## O que foi bem

A estrutura do backend saiu mais limpa do que eu esperava. Separar em controller, service e rotas parecia exagero para um projeto tão pequeno, mas na hora de escrever os testes isso valeu muito a pena. Consegui testar o TicketService de forma totalmente isolada e ainda ter testes de integração batendo nas rotas via supertest, sem precisar subir servidor de verdade em nenhum momento.

Os testes com Vitest foram tranquilos. Pensei em ir de Jest por costume, mas o Vitest funcionou praticamente sem configuração e o ciclo de feedback ficou tão curto que me deu vontade de escrever mais teste em vez de deixar para depois.

O Kanban com WIP limits ajudou a não me espalhar. Ter o limite de três na coluna de In Progress me obrigou a fechar um item antes de abrir o próximo. Na prática isso evitou aquela situação chata de ter três coisas começadas ao mesmo tempo e nenhuma pronta.

## O que pode melhorar

Comecei a pensar no banco de dados tarde demais. Quando cheguei na issue de criar a estrutura do banco, percebi que tinha uma dúvida grande que deveria ter aparecido bem antes: se os tickets são descartáveis ou se precisam ser persistidos. Acabei resolvendo na hora, mas se eu tivesse levantado essa pergunta no começo da sprint, teria entrado na implementação com muito mais clareza.

As dailies também não aconteceram com a regularidade que deveriam. Como estou desenvolvendo sozinho, é fácil achar que daily é ritual de time e que não serve para projeto individual. Mas na prática acaba que eu perco o momento fixo de parar, olhar o que estou fazendo e ver o que está travado. Preciso encarar isso como compromisso comigo mesmo.

## Ações para a próxima sprint

Quero fechar a decisão do banco logo no início da sprint, antes de escrever qualquer código que dependa dela. Entre Supabase e Postgres puro, vou bater o martelo na primeira daily e partir para a implementação sem ficar em cima do muro.

Vou tentar fazer commits menores, pelo menos um por funcionalidade ou por ajuste de teste, mesmo que pareça desnecessário para um projeto individual. Mais importante do que o tamanho é acostumar a mão a commitar com contexto claro.

A retrospectiva em si também tem que virar hábito. Escrever só no fim da sprint funciona, mas acabo perdendo nuances do que rolou no meio do caminho. Quero anotar coisas curtas durante a semana e montar o documento final em cima dessas notas.
