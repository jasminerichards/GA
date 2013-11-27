//This example students take their JS Object and use their html/css skills to bring it to the browser.

$(
function(){

	var account = {
			owner: ' ',
			account_num: '00000',
			balance: 100,
			date_open: ' '
	};

	account = setupAccount(account);
	$('h2').html(account.owner);
	$('h3').append(' ' + account.account_num);
	$('p').append(' ' + account.date_open);
}
);

function setupAccount(new_account){
	new_account.owner = prompt('What is the account owners name?');
	new_account.account_num = prompt('What is the account number');
	new_account.date_open = new Date().toString();
	console.log(new_account);
	return new_account;

}

