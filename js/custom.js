(function(){
"use strict";
'use strict';

var app = angular.module('viewCustom', ['angularLoad']);

app.controller('RequestServicesAfterController', [function () {
    var vm = this;
}]);

app.component('prmRequestServicesAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'RequestServicesAfterController',
    template: '<remove-specific-request-for-location parent-ctrl="$ctrl.parentCtrl"></remove-specific-request-for-location>'

});

app.constant('removeSpecificRequestForLocationStudioConfig', [{ "libraryCode": "SPECCOLL", "subLocationCode": "spe-graarc, spe-arc, spe-aav, spe-bkmar8, spe-bkmav7, spe-bkmst8, spe-bkmcr8, spe-bkmco8, spe-bkmcs8, spe-elb238, spe-elb343, spe-bkmofc, spe-bkmmf8, spe-bkmov8, spe-dml233, spe-bkmso8, spe-dml205, spe-dml207, spe-dml208, spe-209A, spe-dml214, spe-ealarc, spe-ealeas, spe-fml, spe-fmo, spe-hol, spe-hov, spe-hor, spe-ofc, spe-mfr, spe-lv7rar, spe-lv8rar, spe-grarar, spe-lv7rfl, spe-lv8rfl, spe-lv7rm, spe-lv7rov, spe-lv8rov, spe-lv7sm, spe-lv7rso, spe-lv8rso, spe-eassto, UNASSIGNED, spe-vlt, spe-vltbrg, spe-vltbwi, spe-vltcre, spe-vltflt, spe-vltovr, spe-vltwid, spe-vla", "displayLabel": "Request from Special Collections" }, { "libraryCode": "CINEMA", "subLocationCode": "cin-cag, cin-cgo, cin-cgs", "displayLabel": "Request from Cinema Arts Library" }, { "libraryCode": "ONEARCHIVE", "subLocationCode": "one-arc, one-stk, one-exb, one-gpf, one-lpf, one-ovr, one-pmo, one-pam, one-prr, one-plf, one-ref", "displayLabel": "Request from ONE Archives" }]);

app.controller('removeSpecificRequestForLocationController', ['removeSpecificRequestForLocationStudioConfig', '$scope', '$timeout', '$translate', function (addonParameters, $scope, $timeout, $translate) {
    var vm = this.parentCtrl;
    var services2;
    var servicesWithReolvedLinks;
    var matches;
    var reqAlert = { "type": 2, "_htmlMsg": "Noam", "_alwaysOn": false };
    this.fakeGuest = false;
    this.getFakeGuest = getFakeGuest;
    this.$onInit = function () {
        if (!this.parentCtrl.isLoggedIn()) {

            this.parentCtrl.isLoggedIn = function () {
                return true;
            };

            this.parentCtrl.getServicesFromIls();
            var _this = this;
            $timeout(function () {
                _this.fakeGuest = true;
                if (vm.services.serviceinfo) {
                    services2 = vm.services.serviceinfo;
                    calculateRemove();
                }
            }, 3000);
        }
    };

    function getFakeGuest() {
        return this.fakeGuest;
    }

    function calculateRemove() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {

            for (var _iterator = addonParameters[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var addonParameter = _step.value;

                matches = [];
                var libraryCode = addonParameter.libraryCode;
                var subLocationCodes = addonParameter.subLocationCode;
                var displayLabel = addonParameter.displayLabel;
                var subLocationCode = subLocationCodes ? subLocationCodes.split(/\s*,\s*/) : [];
                var holding = [];
                if (vm.item.delivery.holding) {
                    holding = vm.item.delivery.holding.filter(function (holding) {
                        return libraryCode === holding.libraryCode;
                    }).filter(function (holding) {
                        if (subLocationCode.indexOf(holding.subLocationCode) !== -1) {
                            matches.push({ libraryCode: holding.libraryCode, librarycodeTranslation: holding.librarycodeTranslation, subLocation: holding.subLocation, callNumber: holding.callNumber });
                        }
                        return subLocationCode.indexOf(holding.subLocationCode) !== -1;
                    });
                }
                if (services2.length > 0 && holding.length === 0) {
                    services2 = services2.filter(function (e) {
                        return displayLabel !== e.type;
                    });
                } else {
                    if (services2.length > 0) {
                        services2.forEach(function (service) {
                            if (matches && matches.length > 0) {
                                matches.forEach(function (match) {
                                    var clonedService = angular.copy(service);
                                    var link = clonedService['link-to-service'];
                                    var libraryName = match.librarycodeTranslation;
                                    link = link.replace(/location=&/, 'location=' + match.libraryCode + '&');
                                    link = link.replace(/site=(.*?)&/, 'site=' + match.subLocation + '&');
                                    link = link.replace(/callnum=&/, 'callnum=' + match.callNumber + '&');
                                    clonedService['link-to-service'] = link;
                                    //added the last dot as a hack - this way the translator will keep the text as is
                                    clonedService.type += '/' + libraryName + ' ' + match.subLocation + '(' + match['callNumber'] + ').';
                                    if (servicesWithReolvedLinks === undefined) {
                                        servicesWithReolvedLinks = [];
                                    }
                                    servicesWithReolvedLinks.push(clonedService);
                                });
                            }
                        });
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        vm.services.serviceinfo = servicesWithReolvedLinks || services2;
    }
}]);

app.component('removeSpecificRequestForLocation', {
    controller: 'removeSpecificRequestForLocationController',
    bindings: { parentCtrl: '<' },
    template: '<div ng-if="$ctrl.getFakeGuest()" layout="row" class="bar alert-bar zero-margin-bottom" layout-align="center center">\n                <span class="bar-text margin-right-small" translate="nui.request.signin"></span>\n                <prm-authentication [is-logged-in]="false" flex="none"></prm-authentication>\n              </div>'
});
})();