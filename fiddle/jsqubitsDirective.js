function jsqubitsDirective() {

    return {
    
       scope: {
            jsqubitsvis: '='
        },
        
        link: function postLink(scope, element, attrs) {
            scope.jsqubitsvis.display(element);
        }
    };
    
}
