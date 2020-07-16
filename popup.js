let generateCSV = document.getElementById('generateCSV');

function getLoans() {
  const parseLoan = (loan) => {

    const topRow = loan.querySelector('._24Qwagdk').children;
    

    const lender = loan.querySelector('._3oNaBUOZ._1B4_JOwH.lN_Hn_F3._26zbLcDC').textContent;
    const interest_rate = topRow[0].querySelector('._3Laaoq7U._3kmgqabP._92mVf2sd.lN_Hn_F3._26zbLcDC').textContent.replace(/[^0-9.%]/g, '');

    const apr = topRow[0].querySelector('._2laQWIVw._3kmgqabP._181T4gJT.lN_Hn_F3._26zbLcDC').textContent.replace(/[^0-9.%]/g, '');
    const rate_type = topRow[1].querySelector('.didNIdwB ._3Laaoq7U._253Cb2Tw._92mVf2sd.lN_Hn_F3._26zbLcDC').textContent;
    const total_interest = topRow[2].querySelector('._3Laaoq7U._253Cb2Tw._92mVf2sd.lN_Hn_F3._26zbLcDC').textContent;
    

    let payment_during_school;
    let payment_after_school;
    let duration;

    if (loan.querySelector('._1h7v4I0H')) {
      const afterSchoolDetails = loan.querySelector('._3Laaoq7U.didNIdwB');
      payment_during_school = loan.querySelector('._3Laaoq7U._1niZNOeu ._253Cb2Tw._92mVf2sd.lN_Hn_F3._26zbLcDC').textContent;
      payment_after_school = afterSchoolDetails.querySelectorAll('._253Cb2Tw._92mVf2sd.lN_Hn_F3._26zbLcDC')[0].textContent;
      duration = afterSchoolDetails.querySelectorAll('._253Cb2Tw._92mVf2sd.lN_Hn_F3._26zbLcDC')[1].textContent;
    } else {
      payment_during_school = loan.querySelectorAll('._3Laaoq7U._3kmgqabP._253Cb2Tw._92mVf2sd.lN_Hn_F3._26zbLcDC')[0].textContent;
      payment_after_school = loan.querySelectorAll('._3Laaoq7U._3kmgqabP._253Cb2Tw._92mVf2sd.lN_Hn_F3._26zbLcDC')[0].textContent;
      duration = loan.querySelector('._15WnuB0e + ._253Cb2Tw._92mVf2sd.lN_Hn_F3._26zbLcDC').textContent;
    }

    return {
      lender,
      interest_rate,
      apr,
      rate_type,
      total_interest,
      payment_during_school,
      payment_after_school,
      duration
    }
  };

  const loanCSSClass = '._12uDxgdo';
  const getLoans = () => document.querySelectorAll(loanCSSClass);

  const expanderDOMElem = document.querySelector('._3EZ1XPOO');
  const currNumLoans = getLoans().length;

  const parseAndSendLoans = () => {
    const loansDOM = Array.prototype.slice.call(getLoans());
    const loans = loansDOM.map(parseLoan);
    chrome.runtime.sendMessage(loans);
  }
  
  if (expanderDOMElem.textContent === 'Show 63 less relevant loan options') {
    expanderDOMElem.click();
    function attemptParse() {
      if ((getLoans().length > currNumLoans) && (parseLoan(getLoans()[getLoans().length - 1]).lender)) {
        parseAndSendLoans();
      } else {
        window.setTimeout(attemptParse, 100);
      }
    }
    attemptParse();
  } else {
    parseAndSendLoans();
  }
}

generateCSV.onclick = function(element) {
  generateCSV.textContent = 'One sec...';
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    new Promise((resolve) => {
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          resolve(request);
        }
      );
    }).then((loans) => {
      generateCSV.textContent = 'Done!';
      window.setTimeout(() => {generateCSV.textContent = 'Go!';}, 2000)
      let element = document.createElement('a');
      const headers = Object.keys(loans[0]);
      const headerNames = headers.map(header => `"${header.replace('_', ' ')}"`).join(',');
      const content = loans.map((loan) => {
        return headers.map(header => `"${loan[header]}"`).join(',');
      }).join('\n');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(headerNames + "\n" + content));
      element.setAttribute('download', 'credible.csv');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    });
    chrome.tabs.executeScript(
      tabs[0].id,
      {code: '(' + getLoans + ')();'}
    );
  });
};