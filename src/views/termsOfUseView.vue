<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="legal-page">
    <RouterLink to="/" class="back">← Voltar aos recados</RouterLink>
    <article class="document">
      <span class="eyebrow">DOCUMENTOS DA COMUNIDADE</span>
      <h1>Termos de Uso</h1>
      <p class="updated">Versão de 20 de novembro de 2026</p>
      <p>
        Bem-vindo ao Recados da comunidade Nossa Senhora dos Migrantes. Estes Termos de Uso
        descrevem as condições para acessar o site, consultar as publicações e criar uma conta.
      </p>

      <h2>1. Finalidade da plataforma</h2>
      <p>
        O Recados é um canal de divulgação de eventos, datas, avisos e informações relacionadas à
        vida da comunidade. O conteúdo é informativo e pode ser atualizado, corrigido ou retirado
        pela equipe responsável.
      </p>

      <h2>2. Conta e acesso</h2>
      <p>
        Você pode consultar informações públicas sem criar uma conta. Para utilizar recursos que
        exigem identificação, como enviar perguntas, é necessário cadastrar nome, e-mail e senha. Ao
        se cadastrar, forneça informações verdadeiras, proteja suas credenciais e não compartilhe o
        acesso à sua conta.
      </p>

      <h2>3. Uso adequado</h2>
      <p>
        Não utilize a plataforma para publicar mensagens ofensivas, discriminatórias, fraudulentas,
        conteúdos ilegais ou dados pessoais de terceiros sem autorização. Não tente acessar contas
        alheias, contornar permissões ou comprometer a segurança do sistema.
      </p>

      <h2>4. Publicações e perguntas</h2>
      <p>
        Recados e avisos podem ser modificados pela administração. As perguntas enviadas por
        usuários autenticados são destinadas à administração; as respostas ficam disponíveis na área
        do próprio usuário. Evite compartilhar informações pessoais sensíveis ou de terceiros nos
        campos de texto.
      </p>

      <h2>5. Direitos sobre o conteúdo</h2>
      <p>
        Textos, imagens, elementos visuais e demais materiais da plataforma pertencem a seus
        respectivos titulares. Não é permitida a reprodução indevida de conteúdos protegidos.
        Referências a terceiros não transferem a titularidade desses materiais à comunidade.
      </p>

      <h2>6. Disponibilidade e alterações</h2>
      <p>
        Buscamos manter o serviço acessível e atualizado, mas podem ocorrer manutenções,
        indisponibilidades e mudanças de funcionalidades. Estes termos também podem ser revisados.
        Uma nova versão poderá exigir nova ciência ou aceite, quando aplicável.
      </p>

      <h2>7. Privacidade</h2>
      <p>
        Para entender o tratamento de dados relacionado à conta e ao uso do Recados, consulte a
        <RouterLink to="/politica-de-privacidade">Política de Privacidade</RouterLink>.
      </p>

      <h2>8. Contato</h2>
      <p>
        Para dúvidas sobre a plataforma, entre em contato com a administração da comunidade. O
        perfil público da comunidade é
        <a
          href="https://www.instagram.com/nossasenhoradosmigrantesjp/"
          target="_blank"
          rel="noopener noreferrer"
          >@nossasenhoradosmigrantesjp</a
        >.
      </p>
      <p class="note">
        Ao marcar a caixa de aceite no cadastro, você declara que leu e concorda com a versão destes
        Termos de Uso.
      </p>
    </article>
  </main>
</template>

<style scoped>
.legal-page {
  width: min(880px, 92%);
  margin: 30px auto 60px;
  font-family: 'Comfortaa', sans-serif;
  color: #18332a;
}
.back {
  display: inline-block;
  margin-bottom: 20px;
  color: #0a6a4c;
  font-size: 13px;
  text-decoration: none;
}
.document {
  background: white;
  border: 1px solid #d6e1df;
  border-radius: 16px;
  padding: clamp(22px, 5vw, 48px);
  box-shadow: 0 5px 20px #123d2710;
}
.eyebrow {
  color: #0a6a4c;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
}
h1 {
  margin: 12px 0;
  font-size: clamp(25px, 4vw, 34px);
}
.updated {
  margin: 0 0 30px;
  color: #647273;
  font-size: 12px;
}
h2 {
  margin: 27px 0 10px;
  font-size: 17px;
  line-height: 1.45;
}
p {
  margin-bottom: 13px;
  color: #465d53;
  font-size: 13px;
  line-height: 1.9;
}
a {
  color: #08704f;
  overflow-wrap: anywhere;
}
.note {
  margin-top: 25px;
  border-top: 1px solid #d6e1df;
  padding-top: 20px;
  font-weight: 700;
}
</style>
