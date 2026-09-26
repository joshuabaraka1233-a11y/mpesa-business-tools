const tools=[
['↗','Profit Calculator','Know your profit on every sale.','profit'],
['▥','Daily Sales','Track sales, costs and profit.','sales'],
['−','Expense Tracker','Record where your business money goes.','expenses'],
['→','Sales Target','Set a profit goal and know what to sell.','target'],
['↗','Business Insights','See the numbers behind your business.','insights'],
['₿','M-Pesa Fees','Quick transaction fee estimate.','fees'],
['□','Stock & Pricing','Set a selling price from your cost.','stock'],
['▤','Receipt Generator','Create a clean customer receipt.','receipt'],
['%','Loan Calculator','Estimate monthly repayments.','loan']
];
const grid=document.getElementById('toolGrid');
grid.innerHTML=tools.map(function(t){return '<button class="tool" data-nav="'+t[3]+'"><div class="icon">'+t[0]+'</div><h3>'+t[1]+'</h3><p>'+t[2]+'</p></button>';}).join('');

function setActive(id){document.querySelectorAll('.side-nav button,.mobile-nav button').forEach(function(b){b.classList.toggle('active',b.dataset.nav===id);});}
function show(id){document.querySelectorAll('.view').forEach(function(x){x.classList.remove('active');});var view=document.getElementById(id);if(view)view.classList.add('active');setActive(id);window.scrollTo({top:0,behavior:'smooth'});}
document.addEventListener('click',function(e){var b=e.target.closest('[data-nav]');if(b)show(b.dataset.nav);});

var ksh=function(n){return 'KSh '+Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2});};
var todayKey=function(){return new Date().toISOString().slice(0,10);};

var sales=JSON.parse(localStorage.getItem('mbt-sales')||'[]');
var expenses=JSON.parse(localStorage.getItem('mbt-expenses')||'[]');
var target=JSON.parse(localStorage.getItem('mbt-target')||'null');

function todaySales(){return sales.filter(function(x){return !x.date||x.date===todayKey();});}
function todayExpenses(){return expenses.filter(function(x){return x.date===todayKey();});}

function updateHomeStats(){
 var ts=todaySales(),te=todayExpenses();
 var total=ts.reduce(function(a,x){return a+x.amount;},0),cost=ts.reduce(function(a,x){return a+x.cost;},0),expenseTotal=te.reduce(function(a,x){return a+x.amount;},0);
 var hs=document.getElementById('homeSales'),hp=document.getElementById('homeProfit'),ht=document.getElementById('homeTransactions'),d=document.getElementById('homeDate');
 if(hs)hs.textContent=ksh(total);
 if(hp)hp.textContent=ksh(total-cost-expenseTotal);
 if(ht)ht.textContent=ts.length;
 if(d)d.textContent=new Date().toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'short'});
 renderInsights();
}

function calcProfit(){
 var b=+buyPrice.value,s=+sellPrice.value,q=+qty.value||1,c=(s-b)*q;
 profitResult.innerHTML='<div class="stat">Profit<strong>'+ksh(c)+'</strong></div><div class="stat">Total sales<strong>'+ksh(s*q)+'</strong></div><div class="stat">Profit per item<strong>'+ksh(s-b)+'</strong></div>';
}

function renderSales(){
 var ts=todaySales();
 salesDate.textContent=new Date().toLocaleDateString('en-KE',{weekday:'long',day:'numeric',month:'short',year:'numeric'});
 salesList.innerHTML=ts.length?ts.map(function(x){return '<div class="sale"><div><b>'+x.name+'</b><small>Cost '+ksh(x.cost)+'</small></div><div><b>'+ksh(x.amount)+'</b><small>Profit '+ksh(x.amount-x.cost)+'</small></div></div>';}).join(''):'<p class="muted">No sales added yet.</p>';
 var total=ts.reduce(function(a,x){return a+x.amount;},0),cost=ts.reduce(function(a,x){return a+x.cost;},0),ex=todayExpenses().reduce(function(a,x){return a+x.amount;},0);
 salesSummary.innerHTML='<div class="stat">Today\'s sales<strong>'+ksh(total)+'</strong></div><div class="stat">Today\'s profit after expenses<strong>'+ksh(total-cost-ex)+'</strong></div>';
 updateHomeStats();
}

function addSale(){
 var n=saleName.value.trim(),a=+saleAmount.value,c=+saleCost.value||0;
 if(!n||a<0)return;
 sales.push({name:n,amount:a,cost:c,date:todayKey()});
 localStorage.setItem('mbt-sales',JSON.stringify(sales));
 saleName.value='';saleAmount.value='';saleCost.value='';
 renderSales();
}

function clearSales(){
 if(confirm("Clear today's sales?")){
  sales=sales.filter(function(x){return x.date&&x.date!==todayKey();});
  localStorage.setItem('mbt-sales',JSON.stringify(sales));
  renderSales();
 }
}

function addExpense(){
 var n=expenseName.value.trim(),a=+expenseAmount.value,c=expenseCategory.value;
 if(!n||a<=0)return;
 expenses.push({name:n,amount:a,category:c,date:todayKey()});
 localStorage.setItem('mbt-expenses',JSON.stringify(expenses));
 expenseName.value='';expenseAmount.value='';
 renderExpenses();updateHomeStats();
}

function renderExpenses(){
 var list=todayExpenses(),total=list.reduce(function(a,x){return a+x.amount;},0);
 expenseList.innerHTML=list.length?list.map(function(x){return '<div class="sale expense-row"><div><b>'+x.name+'</b><small>'+x.category+'</small></div><div><b>'+ksh(x.amount)+'</b><small>Today</small></div></div>';}).join(''):'<p class="muted">No expenses added today.</p>';
 expenseSummary.innerHTML='<div class="stat">Today\'s expenses<strong>'+ksh(total)+'</strong></div>';
}

function calcTarget(){
 var goal=+targetAmount.value||0,avg=+targetProfit.value||0;
 if(goal<=0||avg<=0){targetResult.innerHTML='<div class="stat">Enter a target and average profit per sale.</div>';return;}
 var salesNeeded=Math.ceil(goal/avg);
 target={goal:goal,avg:avg,salesNeeded:salesNeeded};
 localStorage.setItem('mbt-target',JSON.stringify(target));
 var current=todaySales().reduce(function(a,x){return a+(x.amount-x.cost);},0);
 var remaining=Math.max(0,goal-current),remainingSales=Math.ceil(remaining/avg);
 targetResult.innerHTML='<div class="stat">Profit target<strong>'+ksh(goal)+'</strong></div><div class="stat">Sales needed<strong>'+salesNeeded+'</strong><span class="muted"> at '+ksh(avg)+' average profit each</span></div><div class="stat">Still needed today<strong>'+remainingSales+' sales</strong></div>';
}

function renderInsights(){
 var ts=todaySales(),te=todayExpenses(),salesTotal=ts.reduce(function(a,x){return a+x.amount;},0),costTotal=ts.reduce(function(a,x){return a+x.cost;},0),expenseTotal=te.reduce(function(a,x){return a+x.amount;},0),profit=salesTotal-costTotal-expenseTotal;
 var margin=salesTotal?Math.max(0,(profit/salesTotal)*100):0;
 var best='—',counts={};
 ts.forEach(function(x){counts[x.name]=(counts[x.name]||0)+1;});
 Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];})[0]&&(best=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];})[0]);
 var cards=[
 ['Sales',ksh(salesTotal),'Today'],
 ['Expenses',ksh(expenseTotal),'Today'],
 ['Net profit',ksh(profit),'After costs'],
 ['Margin',margin.toFixed(1)+'%','Current'],
 ['Transactions',ts.length,'Sales recorded'],
 ['Top item',best,'Most frequent sale']
 ];
 var el=document.getElementById('insightCards');
 if(el)el.innerHTML=cards.map(function(c){return '<div class="insight-card"><span>'+c[0]+'</span><strong>'+c[1]+'</strong><small>'+c[2]+'</small></div>';}).join('');
 var msg=document.getElementById('insightMessage');
 if(msg){
  var text=ts.length===0?'Add your first sale to start seeing useful business insights.':
    profit>0?'Your business is showing a positive net result today. Keep recording every sale and expense to see a clearer picture.':
    'Your recorded costs are currently higher than your sales profit today. Check your expenses and pricing before the day ends.';
  if(target&&target.goal){var remaining=Math.max(0,target.goal-profit);text+=' Your saved target is '+ksh(target.goal)+' and you are '+ksh(remaining)+' away from it.';}
  msg.innerHTML='<strong>Business note</strong><p>'+text+'</p>';
 }
}

function calcStock(){var c=+stockCost.value||0,m=+margin.value||0,q=+stockQty.value||1,price=c/(1-m/100);stockResult.innerHTML='<div class="stat">Recommended selling price<strong>'+ksh(price)+'</strong></div><div class="stat">Profit per item<strong>'+ksh(price-c)+'</strong></div><div class="stat">Total profit ('+q+' items)<strong>'+ksh((price-c)*q)+'</strong></div>';}

function calcFee(){var a=+feeAmount.value||0,type=feeType.value,fee=0;if(type==='deposit')fee=0;else if(type==='send'){if(a<=100)fee=6;else if(a<=500)fee=7;else if(a<=1000)fee=13;else if(a<=1500)fee=23;else if(a<=2500)fee=33;else if(a<=3500)fee=53;else if(a<=5000)fee=57;else if(a<=7500)fee=78;else if(a<=10000)fee=90;else fee=108;}else{fee=a<=50?0:a<=2500?32:a<=5000?69:a<=10000?115:a<=15000?167:a<=20000?185:197}feeResult.innerHTML='<div class="stat">Estimated fee<strong>'+ksh(fee)+'</strong></div><p class="muted">Tariffs can change. Verify the current Safaricom tariff before relying on this figure.</p>';}

function makeReceipt(){var biz=bizName.value||'My Business',cust=customer.value||'Customer',item=receiptItem.value||'Item',q=+receiptQty.value||1,p=+receiptPrice.value||0,total=q*p;receiptOutput.innerHTML='<div class="receipt" id="printReceipt"><h3>'+biz+'</h3><p>Customer: '+cust+'</p><div class="line"><span>'+item+' × '+q+'</span><b>'+ksh(total)+'</b></div><div class="line"><b>Total</b><b>'+ksh(total)+'</b></div><p class="muted" style="text-align:center">Thank you for your business</p><button class="primary" onclick="shareReceipt(\''+encodeURIComponent(biz)+'\',\''+encodeURIComponent(item)+'\',\''+total+'\')">Share on WhatsApp</button></div>';}

function shareReceipt(b,i,t){var msg=decodeURIComponent(b)+'%0AReceipt%0A'+decodeURIComponent(i)+'%0ATotal: KSh '+Number(t).toLocaleString()+'%0AThank you for your business!';window.open('https://wa.me/?text='+msg,'_blank');}

function calcLoan(){var P=+loanAmount.value||0,r=(+loanRate.value||0)/100/12,n=+loanMonths.value||1,m=r?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):P/n;loanResult.innerHTML='<div class="stat">Estimated monthly payment<strong>'+ksh(m)+'</strong></div><div class="stat">Total repayment<strong>'+ksh(m*n)+'</strong></div><div class="stat">Estimated interest<strong>'+ksh(m*n-P)+'</strong></div><p class="muted">This assumes a standard reducing-balance monthly repayment and excludes fees or insurance.</p>';}

var deferred;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;installBtn.classList.remove('hidden');});
installBtn.onclick=async function(){if(deferred){deferred.prompt();deferred=null;installBtn.classList.add('hidden');}};

renderSales();
renderExpenses();
updateHomeStats();
if(target){var ta=document.getElementById('targetAmount'),tp=document.getElementById('targetProfit');if(ta)ta.value=target.goal;if(tp)tp.value=target.avg;}
setActive('home');
