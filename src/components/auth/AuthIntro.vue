<template>
  <div class="auth-intro">
    <span class="intro-label">VIDA EM COMUNIDADE</span>
    <img src="/img/logo-removebg-preview.png" alt="" class="community-logo" />
    <h1>A comunidade se encontra aqui.</h1>
    <p>Um espaço para compartilhar recados, acompanhar os encontros e estar mais perto.</p>
    <div class="community-note">
      <span class="mdi mdi-account-group-outline" aria-hidden="true"></span>
      <span>Conectados pela fé e pelo cuidado com o próximo.</span>
    </div>
  </div>
</template>

<style scoped>
.auth-intro {
  padding: 42px 36px;
  background: #e8f0eb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  color: #0a4c34;
}
.intro-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}
.community-logo {
  width: 106px;
  height: 106px;
  object-fit: contain;
  margin: 32px 0 24px;
}
.auth-intro h1 {
  font-family: 'Comfortaa', sans-serif;
  font-size: 30px;
  line-height: 1.45;
  margin-bottom: 18px;
}
.auth-intro > p {
  font-size: 15px;
  line-height: 1.8;
  color: #526962;
}
.community-note {
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid #cbdcd1;
  margin-top: 38px;
  padding-top: 24px;
  font-size: 13px;
  line-height: 1.6;
}
.community-note .mdi {
  font-size: 28px;
}
@media (max-width: 700px) {
  .auth-intro {
    padding: 26px;
  }
  .community-logo,
  .community-note {
    display: none;
  }
  .auth-intro h1 {
    font-size: 23px;
    margin: 16px 0 10px;
  }
  .auth-intro > p {
    font-size: 14px;
  }
}
</style>
