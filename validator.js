function Validator(option) {

    var getParent = function(element,selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selecterRules = {}
    function validate(inputElement, rule) {
        var errorMessage 
        var errorElement = getParent(inputElement,option.formGroupSelector).querySelector('.form-message')

        var rules = selecterRules[rule.selector]
        for( var i= 0 ; i < rules.length ; ++i) {
            switch (inputElement.type) {
                case 'radio' :
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }

        

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement,option.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement,option.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage;
    }

    var formElement = document.querySelector(option.form)
    if(formElement) {

        formElement.onsubmit = function(e) {
                e.preventDefault();
                var formValid = true;
                option.rules.forEach(function(rule)  {
                    var inputElement = formElement.querySelector(rule.selector);
                    var isValid =  validate(inputElement, rule);
                    
                    if(!isValid) {
                        formValid = false;
                    }
                });
                    
                    if(formValid) {
                        if(typeof option.onSubmit === 'function') {
                            
                            var enableInputs = formElement.querySelectorAll('[name]');
                            var formValues = Array.from(enableInputs).reduce(function(values, input) {
                                
                                switch(input.type) {
                                    case 'radio' :
                                        values[input.name] = formElement.querySelector('input[name = "' + input.name + '"]:checked').value;
                                    break;
                                    case 'checkbox':
                                        if(!input.matches(':checked')) {
                                            values[input.name] = [];
                                            return values;}
                                        if(!Array.isArray(values[input.name])) {
                                            values[input.name] = [];
                                        }

                                        values[input.name].push(input.value)

                                        break;
                                    case 'file': 
                                        values[input.name] = input.files;
                                    break
                                    default:
                                        values[input.name] = input.value;

                                }
                                return values;
                            }, {});
                            option.onSubmit(formValues);
                        }
                        else{
                            formElement.submit();
                        }
                    }

                
               
        }




        option.rules.forEach(function(rule) {

            if(Array.isArray(selecterRules[rule.selector])) {
                selecterRules[rule.selector].push(rule.test);
            }
            else {
                selecterRules[rule.selector] = [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement) {
                if(inputElement) {
                    inputElement.onblur = function() {
                        validate(inputElement, rule)
                    }
        
                    inputElement.oninput = function() {
                        var errorElement = getParent(inputElement,option.formGroupSelector).querySelector('.form-message')
                        errorElement.innerText = '';
                        getParent(inputElement,option.formGroupSelector).classList.remove('invalid')
                    }
                }      
            })
            
        })
    }
    
}

Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test : function(value){
            return value ? undefined : 'vui l??ng nh???p tr????ng n??y';
        }
    }
}

Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test : function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : '????y ch??a ph???i l?? email ';

        }
    }
}

Validator.isminLength = function(selector,min) {
    return {
        selector: selector,
        test : function(value){
            return value.length >= min ? undefined : `vui l??ng nh???p t???i thi???u ${min} k?? t???`;
        }
    }
}

Validator.isPasswordConfirmation = function(selector,getConfirmValue, massage) {
    return {
        selector: selector,
        test : function(value){
            return value === getConfirmValue() ? undefined : massage||`vui l??ng nh???p t???i thi???u ${min} k?? t???`;
        }
    }
}