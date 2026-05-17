# Retrospectiva da Sprint 2

A Sprint 2 foi a sprint de infraestrutura. O foco saiu de escrever funcionalidade e foi para colocar o projeto em pé como uma aplicação de verdade: banco de dados real, frontend, containers e um pipeline de CI/CD. Foi bastante coisa para uma sprint só, e isso aparece tanto nos acertos quanto nos pontos a melhorar.

## O que foi entregue

Troquei o armazenamento em memória por MongoDB usando Mongoose, com um model para o ticket e um contador separado para gerar o número da senha de forma incremental, já que o Mongo não tem auto incremento nativo. Reorganizei o repositório em monorepo, com backend e frontend lado a lado. Comecei o frontend em React com Vite, com uma tela que gera senha e mostra a fila. Escrevi os Dockerfiles do backend e do frontend, o docker-compose subindo a aplicação junto com o Mongo, e o pipeline de CI/CD no GitHub Actions rodando testes, build e deploy. Também documentei duas métricas DORA.

## O que foi bem

Tomar as decisões grandes antes de escrever código ajudou muito. No começo da sprint eu fechei três escolhas: Mongoose em vez do driver nativo, monorepo, e deploy em PaaS. Com isso definido, não tive retrabalho no meio do caminho por ficar mudando de ideia.

A estrutura em camadas que pareceu exagero na Sprint 0 provou o valor de novo. A migração para o Mongo mexeu basicamente no service. O controller e as rotas quase não mudaram, porque a separação já estava lá.

Usar o mongodb-memory-server nos testes foi um bom acerto. Os testes sobem um Mongo em memória sozinhos, então não preciso de banco rodando na máquina nem no CI para a suíte passar. Isso mantém o pipeline simples.

## O que pode melhorar

Acumulei trabalho demais sem commitar. Essa sprint inteira foi feita praticamente sem checkpoints de commit no meio. Isso é arriscado, porque se algo desse errado eu perderia muita coisa de uma vez, e também deixa o histórico menos granular. O mais incômodo é que reduzir o tamanho dos commits já era uma ação que eu tinha escrito na retrospectiva da Sprint 0, e mesmo assim repeti o erro.

Não consegui testar o Docker localmente. O docker-compose e os Dockerfiles estão escritos e a configuração foi validada na sintaxe, mas o Docker Desktop não estava rodando na hora, então o stack ainda não foi provado de ponta a ponta. Escrever sem rodar é confiar no papel.

A parte de deploy ficou pela metade. O pipeline existe e tem o job de deploy, mas ele depende de criar conta no Render e no MongoDB Atlas, o que eu ainda não fiz. Ou seja, o lado CD do CI/CD só fecha de verdade quando essas contas estiverem configuradas.

## Ações para a próxima sprint

Commitar por item entregue, não por sprint. A regra vai ser concreta: terminou o item, faz o commit, move o card no Kanban. Sem exceção, mesmo quando parecer pequeno.

Criar as contas do Render e do MongoDB Atlas logo no primeiro dia da sprint, antes de qualquer coisa que dependa delas, para não deixar a entrega pela metade de novo.

Subir o Docker Desktop e rodar o docker-compose de ponta a ponta antes de considerar o stack pronto. Validar a sintaxe não é o suficiente.

Reservar tempo de verdade para o frontend na próxima sprint, já que nesta ele só foi iniciado e ainda tem bastante a evoluir.
