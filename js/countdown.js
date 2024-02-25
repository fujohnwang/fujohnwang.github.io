window.endTimestamp = null;

function startCountDown(minutes) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    window.endTimestamp = now;

    updateCountdown();
}
function updateCountdown() {
    const currentDate = new Date();
    const timeDifference = window.endTimestamp - currentDate;
    console.log(`now: ${currentDate}`)
    console.log(`diff: ${timeDifference}`)
    console.log(`end: ${endTimestamp}`)

    // 如果倒计时已结束，则停止更新
    if (timeDifference <= 0) {
      document.getElementById('countdown').innerHTML = '倒计时结束';
      return;
    }
  
    // 计算倒计时的分钟和秒
    const minutes = Math.floor(timeDifference / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    // 更新倒计时显示
    document.getElementById('countdown').innerHTML = `${minutes} 分钟 ${seconds} 秒`;
  
    // 每秒更新一次倒计时
    setTimeout(updateCountdown, 1000);
}