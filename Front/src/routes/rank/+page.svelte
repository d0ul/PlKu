<script>
    import { onMount } from 'svelte';
    const title = '랭킹';
    var userLang = "";
    var rankPage = 0;
    onMount(() => {
        userLang = navigator.language.replace("-", "_");
      });
  </script>
  
  <svelte:head>
      <title>플끄 리턴즈 - {title}</title>
  </svelte:head>
  <div class="dark:bg-gray-900 py-24">
    <div class="w-full xl:mx-auto xl:max-w-screen-xl">
      <h2 class="p-4 text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
        사용자 랭킹
      </h2>
      <div class="px-4 pt-4 leaderboard">
        <div class="flex text-xl gap-4 py-4 items-center">
          <span class="text-gray-500 dark:text-gray-400">1위</span>
          <span class="text-black font-bold dark:text-white">시그킨</span>
          <span class="text-gray-500 dark:text-gray-400 text-sm flex-grow text-right">test점</span>
        </div>
      </div>
    </div>
  
  </div>