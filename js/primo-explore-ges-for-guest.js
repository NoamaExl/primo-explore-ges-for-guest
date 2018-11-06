


app.controller('RequestServicesAfterController', [function () {
    var vm = this;
}]);

app.component('prmRequestServicesAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'RequestServicesAfterController',
    template: `<remove-specific-request-for-location parent-ctrl="$ctrl.parentCtrl"></remove-specific-request-for-location>`

});

app.constant('removeSpecificRequestForLocationStudioConfig', [
    { "type": "AEON", "libraryCode": "SPECCOLL", "subLocationCode": "spe-graarc, spe-arc, spe-aav, spe-bkmar8, spe-bkmav7, spe-bkmst8, spe-bkmcr8, spe-bkmco8, spe-bkmcs8, spe-elb238, spe-elb343, spe-bkmofc, spe-bkmmf8, spe-bkmov8, spe-dml233, spe-bkmso8, spe-dml205, spe-dml207, spe-dml208, spe-209A, spe-dml214, spe-ealarc, spe-ealeas, spe-fml, spe-fmo, spe-hol, spe-hov, spe-hor, spe-ofc, spe-mfr, spe-lv7rar, spe-lv8rar, spe-grarar, spe-lv7rfl, spe-lv8rfl, spe-lv7rm, spe-lv7rov, spe-lv8rov, spe-lv7sm, spe-lv7rso, spe-lv8rso, spe-eassto, UNASSIGNED, spe-vlt, spe-vltbrg, spe-vltbwi, spe-vltcre, spe-vltflt, spe-vltovr, spe-vltwid, spe-vla", "displayLabel": "Request from Special Collections" },
    { "type": "AEON", "libraryCode": "CINEMA", "subLocationCode": "cin-cag, cin-cgo, cin-cgs", "displayLabel": "Request from Cinema Arts Library" },
    { "type": "AEON", "libraryCode": "ONEARCHIVE", "subLocationCode": "one-arc, one-stk, one-exb, one-gpf, one-lpf, one-ovr, one-pmo, one-pam, one-prr, one-plf, one-ref", "displayLabel": "Request from ONE Archives" },
    { "type": "ILL", "displayLabel": "Request via interlibrary loan (USC Libraries)", "genres": ['book', 'bookitem', 'conference', 'journal']},
    { "type": "ILL", "displayLabel": "Request via interlibrary loan (Health Science Libraries)", "genres": ['article', 'proceeding']}
]);

app.constant('aeonLocationsInternalExternalMap',
    {"spe-graarc": "ARCHIVES GRAND", "spe-elb238": "BOECKMANN EAST 238", "spe-elb343": "BOECKMANN EAST 343-344", "spe-grarar": "RARE-BOOKS-GRAND", "spe-eassto": "SPECIAL COLLECTIONS EAST STORAGE", "spe-vltbrg": "VAULT-244B-REG", "spe-vltbwi": "VAULT-244B-WIDE", "spe-vltcre": "VAULT-244C-REG", "spe-vltflt": "VAULT-FLAT", "spe-vltovr": "VAULT-OVER", "spe-vltwid": "VAULT-WIDE", "cin-eassto": "EAST STORAGE"}
);

app.controller('removeSpecificRequestForLocationController', ['removeSpecificRequestForLocationStudioConfig', '$scope','$timeout','$translate', 'aeonLocationsInternalExternalMap', function (addonParameters, $scope, $timeout, $translate, aeonLocationsInternalExternalMap) {
    var vm = this.parentCtrl;
    var services2;
    var servicesWithReolvedLinks;
    var fakeGuest = false;
    this.getFakeGuest = getFakeGuest;
    this.$onInit = function () {
        if (!this.parentCtrl.isLoggedIn()){
            fakeGuest = true;

            this.parentCtrl.isLoggedIn = function() {
                return true;
            };

            this.parentCtrl.getServicesFromIls();
        }

        $scope.$watch(function () {
            return vm.services.serviceinfo ? vm.services.serviceinfo : undefined;
        }, function () {
            if ((!services2 && vm.services.serviceinfo) || (services2 && services2.length !== vm.services.serviceinfo.length)) {
                services2 = vm.services.serviceinfo;
                calculateRemove();
            } else {
                services2 = vm.services.serviceinfo;
            }
        });
    };

    function getFakeGuest(){
        return fakeGuest;
    }

    function calculateRemove() {
        for (let addonParameter of addonParameters) {
            var type = addonParameter.type;
            var libraryCode = addonParameter.libraryCode;
            var subLocationCodes = addonParameter.subLocationCode;
            var displayLabel = addonParameter.displayLabel;
            var subLocationCode = subLocationCodes ? subLocationCodes.split(/\s*,\s*/) : subLocationCodes;
            var holding = [];
            var genres = [];

            if (type === "AEON" && vm.item.delivery.holding) {
                holding = vm.item.delivery.holding.filter(function (holding) {
                    return libraryCode === holding.libraryCode;
                }).filter(function (holding) {
                    return subLocationCode.indexOf(holding.subLocationCode) !== -1;
                });
            } else if (type === "ILL" && vm.item.pnx.addata.genre) {
                genres = vm.item.pnx.addata.genre.filter(genre => {
                    return addonParameter.genres.indexOf(genre) !== -1;
                });
            }

            var aeonAndHolding = (type === "AEON" && holding.length === 0);
            var illAndGenres = (type === "ILL" && genres.length === 0);
            var aeonOrGenres = aeonAndHolding || illAndGenres;
            if (services2.length > 0 && aeonOrGenres) {
                services2 = services2.filter(function (e) {
                    return displayLabel !== e.type;
                });
            }
            else {
                if (services2.length > 0) {
                    services2.forEach((service) => {
                        if (service.type === displayLabel) {
                            if (holding.length > 0 || genres.length > 0) {
                                if (type === 'AEON') {
                                    let match = holding[0];
                                    let link = service['link-to-service'];
                                    link = link.replace(/location=[^&]*(&)?/, 'location=' + (aeonLocationsInternalExternalMap[match.subLocationCode] ? aeonLocationsInternalExternalMap[match.subLocationCode] : match.subLocation).toLowerCase() + '$1');
                                    link = link.replace(/callnum=[^&]*(&)?/, 'callnum=' + match.callNumber + '$1');
                                    service['link-to-service'] = link;
                                }

                                if (servicesWithReolvedLinks === undefined) {
                                    servicesWithReolvedLinks = [];
                                }
                                servicesWithReolvedLinks.push(service);
                            }
                        }
                    });
                }
            }
        }
        vm.services.serviceinfo = fakeGuest ? angular.copy(servicesWithReolvedLinks) : services2;
        servicesWithReolvedLinks = [];
    }
}]);

app.component('removeSpecificRequestForLocation', {
    controller: 'removeSpecificRequestForLocationController',
    bindings: { parentCtrl: '<' },
    template:`<div ng-if="$ctrl.getFakeGuest()" layout="row" class="bar alert-bar zero-margin-bottom" layout-align="center center">
                <span class="bar-text margin-right-small" translate="nui.request.signin"></span>
                <prm-authentication [is-logged-in]="false" flex="none"></prm-authentication>
              </div>`
});


