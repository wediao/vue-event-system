<template>
  <div class="user-layout">
    <nav class="user-nav">
      <router-link 
        to="/user/profile" 
        class="nav-item"
        active-class="active"
      >
        個人資料
      </router-link>
      <router-link 
        to="/user/orders" 
        class="nav-item"
        active-class="active"
      >
        我的訂單
      </router-link>
    </nav>
    
    <div class="user-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserLayout"
};
</script>

<style scoped>
.user-layout {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.user-nav {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.nav-item {
  text-decoration: none;
  color: #666;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #6200ee;
  background-color: rgba(98, 0, 238, 0.05);
}

.nav-item.active {
  color: #6200ee;
  background-color: rgba(98, 0, 238, 0.1);
  font-weight: 500;
}

.user-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .user-nav {
    flex-direction: column;
    gap: 10px;
  }

  .nav-item {
    text-align: center;
  }
}
</style> 