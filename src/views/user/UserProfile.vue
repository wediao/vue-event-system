<template>
  <div class="user-profile">
    <h1>個人資料</h1>
    
    <div class="profile-container">
      <div class="profile-section">
        <h2>基本資料</h2>
        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label for="name">姓名</label>
            <input 
              type="text" 
              id="name" 
              v-model="profile.name" 
              required
            >
          </div>

          <div class="form-group">
            <label for="email">電子郵件</label>
            <input 
              type="email" 
              id="email" 
              v-model="profile.email" 
              required
            >
          </div>

          <div class="form-group">
            <label for="phone">手機號碼</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="profile.phone" 
              required
            >
          </div>

          <button type="submit" class="btn-primary">儲存變更</button>
        </form>
      </div>

      <div class="profile-section">
        <h2>變更密碼</h2>
        <form @submit.prevent="updatePassword">
          <div class="form-group">
            <label for="currentPassword">目前密碼</label>
            <input 
              type="password" 
              id="currentPassword" 
              v-model="passwordForm.currentPassword" 
              required
            >
          </div>

          <div class="form-group">
            <label for="newPassword">新密碼</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="passwordForm.newPassword" 
              required
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">確認新密碼</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="passwordForm.confirmPassword" 
              required
            >
          </div>

          <button type="submit" class="btn-primary">更新密碼</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserProfile",
  data() {
    return {
      profile: {
        name: "",
        email: "",
        phone: ""
      },
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }
    };
  },
  methods: {
    async updateProfile() {
      try {
        // TODO: 實作更新個人資料的 API 呼叫
        console.log("更新個人資料", this.profile);
      } catch (error) {
        console.error("更新失敗", error);
      }
    },
    async updatePassword() {
      try {
        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
          alert("新密碼與確認密碼不符");
          return;
        }
        // TODO: 實作更新密碼的 API 呼叫
        console.log("更新密碼", this.passwordForm);
      } catch (error) {
        console.error("更新失敗", error);
      }
    }
  },
  mounted() {
    // TODO: 載入使用者資料
  }
};
</script>

<style scoped>
.user-profile {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.profile-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.profile-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-primary {
  background-color: #6200ee;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #5000c9;
}

@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
  }
}
</style>
 