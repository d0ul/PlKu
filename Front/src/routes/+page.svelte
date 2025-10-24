<script>
  import { onMount } from 'svelte';
	const title = '혼자도 같이도 즐거운 온라인 단어 게임!';
  var userLang = "";

  let jsonData = {"message":{"status":"200","error":{"code":"","msg":""},"result":{"cafeId":31109813,"cafeName":"모렘미","cafeStaff":false,"cafeMember":false,"manageMenus":{"showArticleDelete":false,"showReportBadArticle":false,"showBoardNotice":false,"showOneBoardNotice":false,"showActivityStop":false,"showSecede":false,"showArticleMove":false,"showLevelUp":false,"showRequiredNotice":false,"showPopularArticleHide":false},"requiredNoticeList":[{"articleId":35,"title":"필독공지","isCafeBook":false,"isNewNotice":false}],"mainNoticeList":[{"cafeId":31109813,"articleId":206,"refArticleId":206,"replyListOrder":"","menuId":8,"menuName":"Loading","menuType":"B","restrictMenu":false,"boardType":"L","subject":"불러오는 중","summary":"","writerId":"","writerNickname":"","memberLevel":999,"memberLevelIconId":1,"profileImage":"","newArticle":true,"replyArticle":false,"blindArticle":false,"openArticle":true,"marketArticle":false,"useSafetyPayment":false,"escrow":false,"onSale":false,"cost":0,"formattedCost":"","productSale":{"saleStatus":"NONE","cost":""},"attachImage":true,"attachMusic":false,"attachMovie":false,"attachFile":false,"attachMap":false,"attachGpx":false,"attachPoll":false,"attachLink":false,"attachCalendar":false,"popular":false,"representImage":"","representImageType":"I","imageAttachCount":1,"useHead":true,"headId":12,"headName":"","enableComment":true,"hasNewComment":false,"refArticleCount":0,"readCount":14,"commentCount":0,"writeDateTimestamp":1714362828690,"aheadOfWriteDate":"24.04.29.","formattedReadCount":"14","formattedCommentCount":"0","noticeType":"N","showNoticeDelete":false,"delParent":false,"blogScrap":false,"enableRecommendation":true}]}}};
  let jsonDataFull = {"message":{"status":"200","error":{"code":"","msg":""},"result":{"cafeId":31109813,"cafeName":"모렘미","cafeStaff":false,"cafeMember":false,"blockMemberList":[],"hasNext":true,"articleList":[{"cafeId":31109813,"articleId":209,"refArticleId":209,"replyListOrder":"","menuId":12,"menuName":"Loading","menuType":"B","restrictMenu":false,"boardType":"L","subject":"불러오는 중","memberKey":"","writerNickname":"","memberLevel":110,"memberLevelIconId":1,"memberLiked":false,"profileImage":"","newArticle":true,"replyArticle":false,"blindArticle":false,"openArticle":true,"marketArticle":false,"useSafetyPayment":false,"escrow":false,"onSale":false,"cost":0,"formattedCost":"","productSale":{"saleStatus":"NONE","cost":""},"attachImage":true,"attachMusic":false,"attachMovie":false,"attachFile":false,"attachMap":false,"attachGpx":false,"attachPoll":false,"attachLink":false,"attachCalendar":false,"popular":false,"representImage":"","representImageType":"I","imageAttachCount":20,"useHead":true,"headId":4,"headName":"","enableComment":true,"hasNewComment":false,"refArticleCount":0,"readCount":6,"commentCount":0,"likeItCount":0,"writeDateTimestamp":1714385210767,"delParent":false,"blogScrap":false,"enableRecommendation":false}],"manageMenus":{},"recentNoticeAddDate":1714362828780,"requiredNoticeList":[],"managerDelegate":{},"exposePlugReservation":false,"homeDaAdvertVisible":false,"adFreeGameCafe":false}}};
  let jsonDataServers = { list: [0], max: 0 };
  let randomMessageArray = ["혼자서도 즐겨 보세요!", "클래식과 모던, 두 가지 맛!", "동접 늘려주세요...T.T", "지금 접속하기!", "오리진 쿵쿵따 모드 업데이트!", "수학 대결 모드 업데이트!", "아무도 이 버튼을 안 눌러!", "내 버튼에 있는 내 끄투"];
  const randomMessage = randomMessageArray[Math.floor(Math.random() * randomMessageArray.length)];
  const serverName = ["감자", "냉이", "다래", "레몬", "망고", "보리", "상추", "아욱", "20세 이상"];
  let showModal = false; // 모달 표시 여부를 나타내는 변수

  onMount(async () => {
        const response = await fetch('https://plku.pcor.me/sns/cafe/notice/31109813');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        jsonData = await response.json();

        const responseFull = await fetch('https://plku.pcor.me/sns/cafe/post/31109813/7/0');
        
        if (!responseFull.ok) {
          throw new Error('Failed to fetch data');
        }

        jsonDataFull = await responseFull.json();

        const responseServers = await fetch('https://plku.pcor.me/servers');
        
        if (!responseServers.ok) {
          throw new Error('Failed to fetch data');
        }

        jsonDataServers = await responseServers.json();

        
  });

  onMount(() => {
      userLang = navigator.language.replace("-", "_");
  });

  function checkUI() {
    if (document.cookie.indexOf("uipreference") == -1) {
      showModal = true;
      var modalWindow = document.getElementsByClassName('popup')[0];
      if (modalWindow) {
        modalWindow.classList.remove('hidden');
        modalWindow.classList.remove('modal-back');
        modalWindow.classList.add('modal-front');
      } else {
          console.error("Modal window element not found!");
      }
    }
    else{
      if (document.cookie.indexOf("uipreference=modern") != -1) {
        window.location.href = "https://plku.pcor.me/game?server=0&locale=" + userLang;
      }else{
        window.location.href = "https://plku.pcor.me/o/game?server=0&locale=" + userLang;
      }
    }
  }

  function closeUI() {
      var modalWindow = document.getElementsByClassName('popup')[0];
      if (modalWindow) {
        modalWindow.classList.remove('modal-front');
        modalWindow.classList.add('modal-back');
        setTimeout(() => {
          showModal = false;
          modalWindow.classList.add('hidden');
        }, 300);
      } else {
          console.error("Modal window element not found!");
      }
  }
</script>

<svelte:head>
	<title>플끄 리턴즈 - {title}</title>
</svelte:head>

<div  class="bg-black pt-12">
  <div class="mx-auto py-8 lg:py-24 max-w-screen-xl">
    <div class="px-4 lg:px-0">
    <h2 class="lg:ml-6 text-3xl lg:text-7xl text-white font-bold text-left">
      서비스 종료 안내
    </h2>
    <p class="lg:ml-6 mt-4 text-left text-slate-300 text-xl">
      안녕하십니까, 플끄 리턴즈입니다.<br>
      <strong>5월 6일 자정, 플끄 리턴즈의 서비스가 종료됩니다.</strong><br>
      지난 2023년 말 서비스 시작 이래 2024년 중순 끄투리오와의 통합까지 열정 가득히 운영해온 플끄 리턴즈의 운영은 2025년 5월 6일을 끝으로 종료됩니다.<br>
      다양한 단어 게임 대체제가 등장하고 매년 상당한 운영비가 지출되는 만큼, 추억으로 간직하기 위해서 그간 운영해 온 플끄 리턴즈의 향후 운영이 어렵게 됐습니다.<br><br>
      끄투리오 방문 시 감사의 의미로&nbsp;<img src="/img/kkutu/currency/ping.png" class="h-6 inline-block" alt="Ping"><strong>1,000핑</strong>을 제공드립니다.<br>
      라이브 서비스를 운영하며 배우고 느낀 점을 바탕으로 향후 보다 나은 서비스로 찾아뵙겠습니다.<br>
      감사합니다.
    </p>
    <button class="lg:ml-6 mt-8 mb-12 rounded-2xl text-gray-800 shadow-lg px-6 py-2 font-bold text-2xl transform ease-in duration-100 active:scale-95 lg:hover:scale-110 lg:hover:bg-gradient-to-r lg:hover:from-blue-500 lg:hover:to-purple-500 lg:hover:text-white bg-slate-100" on:click={() => checkUI()}>
       게임 시작 →
    </button>
  </div>
    <div class="mt-8">
      <div class="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-6">
        <div class="bg-slate-900 p-4 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold text-white">환불 문의</h3>
          <p class="mt-2 text-gray-300">환불은 support@plku.pcor.me로 문의 시 가능합니다.<br>
          환불 대상 재화는 2024년 10월 26일 이후 구입한 Patreon MVP 멤버십, PlusCoin(유료)로 구입한 핑이 해당됩니다.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold text-white">개인정보 삭제</h3>
          <p class="mt-2 text-gray-300">서비스 종료 이후 계정 데이터를 포함한 사용자 정보는 개인정보처리방침에 의거 제거됩니다.<br>
          단, 단어 데이터베이스(DB) 및 사용자 디자인 아이템(UGC)은 추후 다른 콘텐츠 개발 시 사용될 수 있습니다.</p>
        </div>
        <div class="bg-slate-900 p-4 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold text-white">추천 대체 서비스</h3>
          <p class="mt-2 text-gray-300">
            끄투리오 : 플끄 리턴즈의 많은 콘텐츠를 만나보실 수 있습니다.<br>
            끄투 온라인 (5월 중 출시) : 끄투의 원작자가 새로 개발중입니다. 아이템전, 낱말집 등 다채로운 경험이 가능합니다.<br>
            다누 : '뭐든지 다 있는 키뮤사전'의 방대한 DB를 바탕으로 끝말잇기를 할 수 있습니다.<br>
            왁뚜 : 새로운 UI와 업적 시스템이 지원되며, 플끄 리턴즈의 &lt;왁타버스&gt; 주제 이상으로 다양한 단어가 존재합니다.
          </p>
        </div>
        <div class="bg-slate-900 p-4 rounded-2xl shadow-lg">
          <h3 class="text-xl font-bold text-white">직접 운영하는 방법</h3>
          <p class="mt-2 text-gray-300">
            플끄 리턴즈는 오픈 소스입니다. (https://github.com/d0ul/Plus-KKuTu)<br>
            라이선스를 준수하여 서버를 구동하면, 다른 프리서버에서는 현재 볼 수 없는 많은 모드를 경험할 수 있습니다.<br><br>
            자세한 문서나 기술 지원은 어렵습니다만 수정한 사항과 출처를 명시 (AGPL)하면 원하는 대로 마음껏 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
</div>
<div class="dark:text-white popup hidden fixed inset-0 z-50 overflow-auto bg-black/50 backdrop-blur-sm flex justify-center items-center">
  <div class="bg-white dark:bg-gray-800 pt-6 pb-8 px-4 lg:px-8 max-w-screen-xl">
    <button class="modal-close top-0 right-0 text-4xl text-gray-500" on:click={() => closeUI()}>&times;</button>
    
    <h3 class="text-3xl font-bold dark:text-white mt-2">UI 선택</h3>
    <p class="text-gray-500 dark:text-gray-300">변경한 UI는 환경설정 → UI 설정에서 되돌릴 수 있습니다.</p>
    
    <!-- 2 cards comparing old and new ui in row -->
    <div class="grid lg:grid-cols-2 gap-4 mt-4">
      <button class="bg-gray-100 dark:bg-gray-900 p-4 lg:p-8 border-blue-500 border-b-4 transform ease-in duration-100 hover:scale-105 hover:bg-blue-500 hover:text-white active:scale-95" on:click={() => {
        document.cookie = "uipreference=modern";
        window.location.href = `https://plku.pcor.me/game?server=0`;
      }} aria-label="Modern">
        <img src="/img/web/ui/modern.png" alt="Modern UI" class="w-full h-24 mb-4 object-cover" />
        <h4 class="text-3xl font-bold">모던 UI</h4>
        <p class="mt-2">
          플끄 리턴즈만의 UI로&nbsp;<br class="hidden lg:block">새롭게 즐길 수 있습니다.
        </p>
      </button>

      <button class="bg-gray-100 dark:bg-gray-900 p-4 lg:p-8 border-purple-500 border-b-4 transform ease-in duration-100 hover:scale-105 hover:bg-purple-500 hover:text-white active:scale-95" on:click={() => {
        document.cookie = "uipreference=classic";
        window.location.href = `https://plku.pcor.me/o/game?server=0`;
      }} aria-label="Classic">
        <img src="/img/web/ui/classic.png" alt="Classic UI" class="w-full h-24 mb-4 object-cover" />
        <h4 class="text-3xl font-bold">클래식 UI</h4>
        <p class="mt-2">
          숙련된 사용자를 위한&nbsp;<br class="hidden lg:block">원작 끄투의 UI입니다.
        </p>
      </button>
  </div>
</div>
</div>

</div>
