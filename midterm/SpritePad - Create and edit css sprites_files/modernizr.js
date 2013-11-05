function check() {
    var flexbox = false;
    var x = document.createElement('div');
    x.style.display = 'box';
    if (x.style.display == 'box') flexbox = true;
    x.style.display = '-webkit-box';
    if (x.style.display == '-webkit-box') flexbox = true;
    x.style.display = '-moz-box';
    if (x.style.display == '-moz-box') flexbox = true;
    x.style.display = '-ms-box';
    if (x.style.display == '-ms-box') flexbox = true;
    x.style.display = '-o-box';
    if (x.style.display == '-o-box') flexbox = true;

    var filereader = false;
    if (typeof FileReader !== 'undefined') filereader = true;

    var canvas = false;
    x = document.createElement('canvas');
    if (typeof x.getContext !== 'undefined') canvas = true;

    if (!canvas || !filereader || !flexbox) {
        document.location.href = 'sorry.html';
    }
}
check();