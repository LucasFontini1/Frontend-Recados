<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="legal-page">
    <RouterLink to="/" class="back">← Voltar aos recados</RouterLink>
    <article class="document">
      <span class="eyebrow">DOCUMENTOS DA COMUNIDADE</span>
      <h1>Política de Privacidade</h1>
      <p class="updated">Versão de 20 de novembro de 2026</p>
      <p>Esta Política descreve como dados pessoais são tratados na plataforma Recados da comunidade Nossa Senhora dos Migrantes, observando os princípios de transparência e proteção previstos na Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>

      <h2>1. Quais dados são utilizados</h2>
      <p>Para criar e manter uma conta, são solicitados nome, endereço de e-mail e senha. A senha é armazenada de forma protegida, utilizando mecanismo de hash, e não deve ser compartilhada. O sistema também pode registrar informações necessárias ao funcionamento da conta, à autenticação, às permissões de acesso e ao aceite dos documentos (data, hora e versão).</p>
      <p>Ao usar funcionalidades autenticadas, informações como perguntas enviadas e respostas recebidas ficam associadas à conta. Informações técnicas essenciais à operação e à segurança podem ser processadas pela infraestrutura de hospedagem.</p>

      <h2>2. Para quais finalidades</h2>
      <p>Os dados são usados para cadastrar e autenticar usuários, disponibilizar funcionalidades de comunicação com a administração, controlar permissões, manter a segurança, prevenir abusos e cumprir obrigações aplicáveis. O aceite dos Termos e a ciência desta Política são registrados para documentar a etapa do cadastro.</p>

      <h2>3. Bases legais</h2>
      <p>Dependendo da finalidade, o tratamento pode se fundamentar na execução de procedimentos relacionados ao uso do serviço, no cumprimento de obrigações legais ou em interesses legítimos aplicáveis, observados os requisitos da LGPD. O aceite destes documentos não substitui eventuais consentimentos específicos exigidos para outras finalidades.</p>

      <h2>4. Armazenamento e serviços de tecnologia</h2>
      <p>O Recados utiliza serviços de hospedagem e infraestrutura para disponibilizar o site, sua API e o banco de dados. Arquivos de imagens de publicações podem utilizar um serviço de armazenamento de mídia. Esses prestadores podem tratar dados necessários à operação técnica, conforme suas próprias condições e contratos.</p>

      <h2>5. Compartilhamento e acesso</h2>
      <p>Informações de conta e perguntas não devem ser divulgadas publicamente por padrão. A equipe administrativa autorizada pode acessá-las na medida necessária para gerenciar a plataforma e responder às solicitações. Dados também podem ser tratados por prestadores técnicos e compartilhados quando houver obrigação legal.</p>

      <h2>6. Cookies, sessão e armazenamento local</h2>
      <p>O aplicativo usa armazenamento local do navegador para manter tokens de autenticação e permitir a continuidade da sessão. Dados técnicos ou cookies podem ser utilizados pelos serviços de infraestrutura para funcionamento, desempenho e segurança. Você pode encerrar a sessão e utilizar controles do navegador para gerenciar dados locais.</p>

      <h2>7. Segurança e conservação</h2>
      <p>São adotados mecanismos de autenticação e controle de acesso. Nenhum ambiente digital é isento de riscos. Os dados serão conservados pelo período necessário às finalidades informadas e às obrigações aplicáveis; quando não houver mais necessidade legítima, poderão ser eliminados ou anonimizados conforme a legislação.</p>

      <h2>8. Seus direitos</h2>
      <p>Você pode solicitar, conforme a LGPD e os requisitos aplicáveis, confirmação e acesso a dados, correção, informações sobre compartilhamento e revisão ou eliminação de dados em situações previstas em lei. Quando o tratamento se basear em consentimento, poderá ser possível revogá-lo. A exclusão de certos dados pode impedir a continuidade de funcionalidades associadas à conta.</p>

      <h2>9. Solicitações e contato</h2>
      <p>Para solicitações relacionadas aos seus dados, procure a administração da comunidade Nossa Senhora dos Migrantes. O perfil de contato divulgado é <a href="https://www.instagram.com/nossasenhoradosmigrantesjp/" target="_blank" rel="noopener noreferrer">@nossasenhoradosmigrantesjp</a>. Para sua segurança, não envie senhas ou documentos pessoais em mensagens públicas.</p>

      <h2>10. Atualizações</h2>
      <p>Esta Política poderá ser alterada para refletir mudanças no funcionamento do Recados ou exigências legais. A versão e a data de atualização serão identificadas nesta página.</p>
      <p class="note">No cadastro, você confirma que leu a Política de Privacidade. Essa confirmação não significa autorização irrestrita para tratar seus dados.</p>
    </article>
  </main>
</template>

<style scoped>
.legal-page { width: min(880px, 92%); margin: 30px auto 60px; font-family: 'Comfortaa', sans-serif; color: #18332a; }
.back { display: inline-block; margin-bottom: 20px; color: #0a6a4c; font-size: 13px; text-decoration: none; }
.document { background: white; border: 1px solid #d6e1df; border-radius: 16px; padding: clamp(22px, 5vw, 48px); box-shadow: 0 5px 20px #123d2710; }
.eyebrow { color: #0a6a4c; font-size: 10px; font-weight: 700; letter-spacing: 1.7px; }
h1 { margin: 12px 0; font-size: clamp(25px, 4vw, 34px); }
.updated { margin: 0 0 30px; color: #647273; font-size: 12px; }
h2 { margin: 27px 0 10px; font-size: 17px; line-height: 1.45; }
p { margin-bottom: 13px; color: #465d53; font-size: 13px; line-height: 1.9; }
a { color: #08704f; overflow-wrap: anywhere; }
.note { margin-top: 25px; border-top: 1px solid #d6e1df; padding-top: 20px; font-weight: 700; }
</style>
