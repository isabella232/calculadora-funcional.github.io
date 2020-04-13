$(function() {
    var lerImagem = function(cb) {
        var elem = window.document.createElement('input');
        elem.style = "display:none;";
        elem.type = "file";
        elem.accept = "image/x-png,image/gif,image/jpeg";
        var mastigar = function(evt) {
            //console.log(evt.target.files);
            var reader = new FileReader();
            reader.onloadend = function(e) {
                const img = new Image();
                img.src = reader.result;
                img.onload = function() {
                    cb({largura: this.width, altura: this.height});
                    document.body.removeChild(elem);
                };
            }
            reader.readAsDataURL(evt.target.files[0]);
        }
        elem.addEventListener('change', mastigar, false);
        document.body.appendChild(elem);
        elem.click();
        //document.body.removeChild(elem);
    }
    var formatDecimal = function(raw, casasDecimais) {
        var quantas = casasDecimais ? parseInt(casasDecimais) : 2;
        if(raw) {
            var resultado = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: quantas }).format(raw).toString();
            return resultado.replace(" ", "").replace(",00", "");
        } else {
            return 0;
        }
    }
    var gcd = function(a, b) {
        return (b == 0) ? a : gcd (b, a%b);
    }

    $("#calc_type").on("change", function() {
        var tipo = $(this).val();
        $("form").not("#calc-"+tipo).each(function() {
            this.reset();
        });
        $("form").not("#calc-"+tipo).hide();
        $("#calc-"+tipo).show();
    }).trigger("change");
    $("form").on("reset", function() {
        var form = $(this);
        form.find(".valRTS, .valIVA, .valDesc, .valRatio").removeClass("valid invalid").prop("readonly", false);
        form.find("#result").val("");
        form.find("input[name='data_submit']").val("");
    });

    //Calculo da Regra de três simples
    var checkaRtsReadonly = function() {
        //verificação para garantir que um campo é deixado sempre sem valor
        var form = $("#calc-rts");
        if(form.find(".valid").length < 3) form.find(".valRTS").prop("readonly", false);
        else if(form.find(".valid").length == 3) form.find(".valRTS:not(.valid)").prop("readonly", true).removeClass("invalid");
        else if(form.find(".valid").length > 3) form.find(".valRTS").last().val("").removeClass("valid").prop("readonly", true);
    }
    $(".valRTS").inputmask( {
        regex: "[1-9]{1}[0-9]*[\,]?[0-9]*",
        "placeholder": " ",
        "oncomplete": function() {
            $(this).addClass("valid");
            checkaRtsReadonly();
        },
        "onincomplete": function() {
            $(this).removeClass("valid");
            checkaRtsReadonly();
        },
        "onKeyDown": function() { $(this).removeClass("invalid"); },
        "onBeforePaste": function() { $(this).removeClass("invalid"); }
    });
    $("#calc-rts").on("submit", function(e) {
        e.preventDefault();
        var este = $(this);
        if(este.find(".valid").length == 3) {
            var vazio = este.find(".valRTS:not(.valid)").attr("id");
            var valor = 0.00;
            switch(vazio) {
                case 'valor1': valor = (parseFloat(este.find("#valor2").val().replace(",", ".")) * parseFloat(este.find("#valor3").val().replace(",", "."))) / parseFloat(este.find("#valor4").val().replace(",", "."));break;
                case 'valor2': valor = (parseFloat(este.find("#valor1").val().replace(",", ".")) * parseFloat(este.find("#valor4").val().replace(",", "."))) / parseFloat(este.find("#valor3").val().replace(",", "."));break;
                case 'valor3': valor = (parseFloat(este.find("#valor1").val().replace(",", ".")) * parseFloat(este.find("#valor4").val().replace(",", "."))) / parseFloat(este.find("#valor2").val().replace(",", "."));break;
                case 'valor4': valor = (parseFloat(este.find("#valor2").val().replace(",", ".")) * parseFloat(este.find("#valor3").val().replace(",", "."))) / parseFloat(este.find("#valor1").val().replace(",", "."));break;
            }
            var resultado = new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2 }).format(valor).toString();
            if(resultado.slice(-3) == ",00") resultado = resultado.replace(",00", "");
            $("#result").val(resultado);
        } else {
            este.find(".valRTS:not(.valid)").addClass("invalid");
        }
    });

    //Calculo do IVA
    var checkaIvaReadonly = function () {
        var form = $("#calc-iva");

        if(form.find(".valid").length >= 2) {
            form.find(".valIVA:not(.valid)").val("").prop("readonly", true).removeClass("invalid");
        } else {
            form.find(".valIVA").prop("readonly", false);
            if(form.find("#ivaValor").hasClass("valid")) {
                form.find("#ivaPerc").val("").prop("readonly", true).removeClass("invalid");
            } else if(form.find("#ivaPerc").hasClass("valid")) {
                form.find("#ivaValor").val("").prop("readonly", true).removeClass("invalid");
            }
        }
    }
    $(".valIVA").inputmask( {
        regex: "[1-9]{1}[0-9]*[\,]?[0-9]*",
        "placeholder": " ",
        "oncomplete": function() {
            $(this).addClass("valid");
            checkaIvaReadonly();
        },
        "onincomplete": function() {
            $(this).removeClass("valid");
            checkaIvaReadonly();
        },
        "onKeyDown": function() { $(this).removeClass("invalid"); },
        "onBeforePaste": function() { $(this).removeClass("invalid"); }
    });
    $("#calc-iva").on("submit", function(e) {
        e.preventDefault();
        var este = $(this);
        if(este.find(".valid").length == 2) {
            if($("#ivaBase").hasClass("valid") && $("#ivaFinal").hasClass("valid")) {
                var ivaBase = parseFloat($("#ivaBase").val().replace(",", "."));
                var ivaFinal = parseFloat($("#ivaFinal").val().replace(",", "."));
                var ivaValor = ivaFinal - ivaBase;
                var ivaPerc = ivaValor * 100 / ivaBase;
                $("#ivaValor").val(formatDecimal(ivaValor)).addClass("valid");
                $("#ivaPerc").val(formatDecimal(ivaPerc)).addClass("valid");
            } else if($("#ivaBase").hasClass("valid") && $("#ivaValor").hasClass("valid")) {
                var ivaBase = parseFloat($("#ivaBase").val().replace(",", "."));
                var ivaValor = parseFloat($("#ivaValor").val().replace(",", "."));
                var ivaFinal = ivaBase + ivaValor;
                var ivaPerc = ivaValor * 100 / ivaBase;
                $("#ivaFinal").val(formatDecimal(ivaFinal)).addClass("valid");
                $("#ivaPerc").val(formatDecimal(ivaPerc)).addClass("valid");
            } else if($("#ivaBase").hasClass("valid") && $("#ivaPerc").hasClass("valid")) {
                var ivaBase = parseFloat($("#ivaBase").val().replace(",", "."));
                var ivaPerc = parseFloat($("#ivaPerc").val().replace(",", "."));
                var ivaValor = ivaPerc * ivaBase / 100;
                var ivaFinal = ivaBase + ivaValor;
                $("#ivaValor").val(formatDecimal(ivaValor)).addClass("valid");
                $("#ivaFinal").val(formatDecimal(ivaFinal)).addClass("valid");
            } else if($("#ivaFinal").hasClass("valid") && $("#ivaPerc").hasClass("valid")) {
                var ivaFinal = parseFloat($("#ivaFinal").val().replace(",", "."));
                var ivaPerc = parseFloat($("#ivaPerc").val().replace(",", "."));
                var ivaBase = ivaFinal / (ivaPerc / 100 + 1);
                var ivaValor = ivaFinal - ivaBase;
                $("#ivaValor").val(formatDecimal(ivaValor));
                $("#ivaBase").val(formatDecimal(ivaBase));
            } else if($("#ivaFinal").hasClass("valid") && $("#ivaValor").hasClass("valid")) {
                var ivaFinal = parseFloat($("#ivaFinal").val().replace(",", "."));
                var ivaValor = parseFloat($("#ivaValor").val().replace(",", "."));
                var ivaBase = ivaFinal - ivaValor;
                var ivaPerc = ivaValor * 100 / ivaBase;
                $("#ivaBase").val(formatDecimal(ivaBase)).addClass("valid");
                $("#ivaPerc").val(formatDecimal(ivaPerc)).addClass("valid");
            }
            este.find(".valIVA").prop("readonly", true);
        } else {
            este.find(".valIVA:not(.valid)").addClass("invalid");
        }
    });

    //Calculo dos Descontos
    var checkaDescReadonly = function() {
        var form = $("#calc-desc");
        if(form.find(".valid").length >= 2) {
            form.find(".valDesc:not(.valid)").val("").prop("readonly", true).removeClass("invalid");
        } else {
            form.find(".valDesc").prop("readonly", false);
            if(form.find("#descValor").hasClass("valid")) {
                form.find("#descPerc").val("").prop("readonly", true).removeClass("invalid");
            } else if(form.find("#descPerc").hasClass("valid")) {
                form.find("#descValor").val("").prop("readonly", true).removeClass("invalid");
            }
        }
    }
    $(".valDesc").inputmask( {
        regex: "[1-9]{1}[0-9]*[\,]?[0-9]*",
        "placeholder": " ",
        "oncomplete": function() {
            $(this).addClass("valid");
            checkaDescReadonly();
        },
        "onincomplete": function() {
            $(this).removeClass("valid");
            checkaDescReadonly();
        },
        "onKeyDown": function() { $(this).removeClass("invalid"); },
        "onBeforePaste": function() { $(this).removeClass("invalid"); }
    });
    $("#calc-desc").on("submit", function(e) {
        e.preventDefault();
        var este = $(this);
        if(este.find(".valid").length == 2) {
            if($("#descBase").hasClass("valid") && $("#descFinal").hasClass("valid")) {
                var descBase = parseFloat($("#descBase").val().replace(",", "."));
                var descFinal = parseFloat($("#descFinal").val().replace(",", "."));
                var descValor = descBase - descFinal;
                var descPerc = descValor * 100 / descBase;
                $("#descValor").val(formatDecimal(descValor));
                $("#descPerc").val(formatDecimal(descPerc));
            } else if($("#descBase").hasClass("valid") && $("#descValor").hasClass("valid")) {
                var descBase = parseFloat($("#descBase").val().replace(",", "."));
                var descValor = parseFloat($("#descValor").val().replace(",", "."));
                var descFinal = descBase - descValor;
                var descPerc = descValor * 100 / descBase;
                $("#descFinal").val(formatDecimal(descFinal));
                $("#descPerc").val(formatDecimal(descPerc));
            } else if($("#descBase").hasClass("valid") && $("#descPerc").hasClass("valid")) {
                var descBase = parseFloat($("#descBase").val().replace(",", "."));
                var descPerc = parseFloat($("#descPerc").val().replace(",", "."));
                var descValor = descPerc * descBase / 100;
                var descFinal = descBase - descValor;
                $("#descValor").val(formatDecimal(descValor));
                $("#descFinal").val(formatDecimal(descFinal));
            } else if($("#descFinal").hasClass("valid") && $("#descPerc").hasClass("valid")) {
                var descFinal = parseFloat($("#descFinal").val().replace(",", "."));
                var descPerc = parseFloat($("#descPerc").val().replace(",", "."));
                var descBase = descFinal * 100 / descPerc;
                var descValor = descBase - descFinal;
                $("#descValor").val(formatDecimal(descValor));
                $("#descBase").val(formatDecimal(descBase));
            } else if($("#descFinal").hasClass("valid") && $("#descValor").hasClass("valid")) {
                var descFinal = parseFloat($("#descFinal").val().replace(",", "."));
                var descValor = parseFloat($("#descValor").val().replace(",", "."));
                var descBase = descFinal + descValor;
                var descPerc = descValor * 100 / descBase;
                $("#descBase").val(formatDecimal(descBase));
                $("#descPerc").val(formatDecimal(descPerc));
            }
            este.find(".valDesc").prop("readonly", true);
        } else {
            este.find(".valDesc:not(.valid)").addClass("invalid");
        }
    });

    //Cálculo de proporção
    var checkaRatioReadonly = function() {
        var form = $("#calc-ratio");
        form.find(".valRatio.valid").prop("readonly", false);
        if(form.find(".valid").length == 2) form.find(".valRatio:not(.valid)").val("").prop("readonly", true).removeClass("invalid");
        else form.find(".valRatio").prop("readonly", false);
    }
    $("#ratio").inputmask( {
        regex: "[1-9]{1}[0-9]*:[1-9]{1}[0-9]*",
        "oncomplete": function() {
            $(this).addClass("valid");
            checkaRatioReadonly();
        },
        "onincomplete": function() {
            $(this).removeClass("valid");
            checkaRatioReadonly();
        },
        "onKeyDown": function() { $(this).removeClass("invalid"); },
        "onBeforePaste": function() { $(this).removeClass("invalid"); }
    });
    $(".int").inputmask( {
        regex: "[1-9]{1}[0-9]*",
        "placeholder": " ",
        "oncomplete": function() {
            $(this).addClass("valid");
            checkaRatioReadonly();
        },
        "onincomplete": function() {
            $(this).removeClass("valid");
            checkaRatioReadonly();
        },
        "onKeyDown": function() { $(this).removeClass("invalid"); },
        "onBeforePaste": function() { $(this).removeClass("invalid"); }
    });
    $("#imgUpload").on("click", function(e) {
        e.preventDefault();
        lerImagem(function(img) {
            if(img) {
                $("#calc-ratio")[0].reset();
                $("#ratioLarg").val(String(img.largura)).addClass("valid");
                $("#ratioAlt").val(String(img.altura)).addClass("valid");
                $("#ratio").prop("readonly", true);
                $("#calc-ratio").trigger("submit");
            }
        });
    });
    $("#calc-ratio").on("submit", function(e) {
        e.preventDefault();
        var este = $(this);
        if(este.find(".valid").length == 2) {
            if(este.find("#ratio").hasClass("valid") == false) {
                var largura = parseInt(este.find("#ratioLarg").val());
                var altura = parseInt(este.find("#ratioAlt").val());
                var r = gcd(largura, altura);
                if(largura > altura) var ratio = String(largura / r)+":"+String(altura / r);
                else var ratio = String(altura / r)+":"+String(largura / r);
                este.find("#ratio").val(ratio).addClass("valid");
            } else if(este.find("#ratioLarg").hasClass("valid") == false) {
                var altura = parseInt(este.find("#ratioAlt").val());
                var ratio = este.find("#ratio").val().split(":");
                var ratioVal = parseInt(ratio[0]) / parseInt(ratio[1]);
                var largura = Math.round(altura * ratioVal);
                este.find("#ratioLarg").val(String(largura)).addClass("valid");
            } else if(este.find("#ratioAlt").hasClass("valid") == false) {
                var largura = parseInt(este.find("#ratioLarg").val());
                var ratio = este.find("#ratio").val().split(":");
                var ratioVal = parseInt(ratio[0]) / parseInt(ratio[1]);
                var altura = Math.round(largura / ratioVal);
                este.find("#ratioAlt").val(String(altura)).addClass("valid");
            }
        } else {
            este.find(".valRatio:not(.valid)").addClass("invalid");
        }
    });

    //Lógica temporal
    $("#data, #data2").pickadate({
        format: "yyyy-mm-dd",
    });
    $("#hora, #hora2").pickatime({
        format: 'HH:i',
        interval: 5
    });
    $("#calc-time").on("submit", function(e) {
        e.preventDefault();
        var quando = "";
        var dataAgora = moment().format("YYYY-MM-DD");
        var horaAgora = moment().format("HH:mm");

        var data = $("#data").val() == "" ? dataAgora : $("#data").val();
        var hora = $("#hora").val() == "" ? horaAgora : $("#hora").val();
        var data2 = $("#data2").val() == "" ? dataAgora : $("#data2").val();
        var hora2 = $("#hora2").val() == "" ? horaAgora : $("#hora2").val();

        var data_hora = moment(data+" "+hora, "YYYY-MM-DD HH:mm");
        var data_hora2 = moment(data2+" "+hora2, "YYYY-MM-DD HH:mm");

        var diff = moment.preciseDiff(data_hora, data_hora2, true);

        if(diff.years > 0) quando += String(diff.years)+(diff.years == 1 ? " ano " : " anos ");
        if(diff.months > 0) quando += String(diff.months)+(diff.months == 1 ? " mês " : " meses ");
        if(diff.days > 0) quando += String(diff.days)+(diff.days == 1 ? " dia " : " dias ");
        if(diff.hours > 0) quando += String(diff.hours)+(diff.hours == 1 ? " hora " : " horas ");
        if(diff.minutes > 0) quando += String(diff.minutes)+(diff.minutes == 1 ? " minuto " : " minutos ");
        if(quando == "") quando = "Sem diferença";

        $("#tempo").val(quando);
    });
});