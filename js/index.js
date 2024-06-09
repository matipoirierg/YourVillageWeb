var defaultColors = [
    {color: 'ffff55', position: 0},
    {color: 'aa0000',position: 100}
];
var startColors = defaultColors;

// Initiate the whole shebang
$(window).on('load', function(){

    if (document.cookie) {
        var gradientCookieStr = getCookie('gradient-data'), gradientCookie;
        if (gradientCookieStr != '') {
            gradientCookie = JSON.parse(getCookie('gradient-data'));
        }
        if (Array.isArray(gradientCookie)) {
            startColors = gradientCookie;
        }
        var uidCookieStr = getCookie('uid-input'), uidCookie;
        if (uidCookieStr != '') {
            uidCookie = JSON.parse(uidCookieStr);
        }
        if (uidCookie !== undefined) {
            $('#uid-input').val(uidCookie);
        }
    }

    gradX("#gradX",{
        sliders: startColors
    });
});

var canvas = document.querySelector('#gradient-reference');
canvas.addEventListener('canvas_updated', function (e) {

    // Get canvas element
    var canvas = document.querySelector('#gradient-reference');
    var ctx = canvas.getContext('2d');

    // Get dimensions of reference canvas
    var canvasRect = canvas.getBoundingClientRect();
    var canvasWidth = canvasRect.width, canvasHeight = canvasRect.height,
        canvasX = canvasRect.x, canvasY = canvasRect.y;

    // Get number of characters
    var textInput = document.querySelector('#uid-input');
    var charCount = textInput.value.length - 1;
    var previewData = [];

    if (charCount < 1) {
        return;
    }

    for (var i = 0; i <= charCount; i++) {
        var x = i * (100/charCount)/100 * (canvasWidth-1) + canvasX, y = canvasY + canvasHeight/2;
        var color = ctx.getImageData(x - canvasX, y - canvasY, 1, 1).data;
        previewData[i] = {
            char: textInput.value.substr(i,1),
            color: color
        }
    }
    updatePreview(previewData);
    saveCookie('uid-input', textInput.value);

}, false);

$('#uid-input').on('input', function(e){
    canvas.dispatchEvent(new Event('canvas_updated'));
});

function updatePreview(data) {
    var len = data.length, $elements = '', rgb_output = '/nick ', hex, prev_hex;
    for (var i = 0; i < len; i++) {
        var char = data[i].char;

        // Convert to hex
        hex = rgbToHex(data[i].color);
        var color_code = '';
        // Only supply code if different colour. This should save some characters.
        if (hex != prev_hex) {
            color_code = '&' + hex;
        }
        var append_code = color_code + data[i].char;
        if (rgb_output.length + append_code.length < 256) {
            rgb_output += color_code + data[i].char;
            $elements += '<span style="color: rgb'+'('+ data[i].color.slice(0,3) +')'+'">'+char+'</span>';
        }
        prev_hex = hex;
    }
    $('#preview span').remove();
    $('#preview').append($elements);
    $('#rgb-code').val(rgb_output);

}

function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(rgb) {
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

function saveCookie(name,data) {
    var expires = new Date();
    expires.setTime(expires.getTime() + 180 * 24 * 3600 * 1000);
    document.cookie = name + "=" + JSON.stringify(data) + ";expires=" + expires.toUTCString() + ";";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

$('#copy-to-clipboard').on('click', function(e) {
    e.preventDefault();
    copyToClipboard($('#rgb-code').val());
    $('#copy-clip-notify .wrap').fadeIn('fast').delay('slow').fadeOut('slow');
});
const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};
