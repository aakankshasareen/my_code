app.filter('mapWithdrawStatus', function () {
    return function (input) {
        switch (input) {
            case 0:
                return 'Pending'; //Pending for Approval
            case 1:
                return 'Approved'; //Approved
            case 2:
                return 'Not Approved'; //Not Approved
        }
    };
})
    .filter('mapDepositStatus', function () {
        return function (input) {
            switch (input) {
                case 0:
                    return 'Failed'; //Failed
                case 1:
                    return 'Success'; //Success
            }
        };
    })
    .filter('mapStatus', function () {
        return function (input) {
            return input == '1' ? 'Active' : 'Inactive';
        }
    })
    .filter('moment1', function () {
        return function (dateString, format) {
            return moment.unix(dateString).format(format);
        };
    })
    .filter('dateFilter', function () { // for date formats in entire frontend
        return function (dateString, format) {
            return moment(new Date(dateString).getTime()).format(format);
        };
    })
    .filter('mapCurrencyType', function () {
        return function (input) {
            return input == '1' ? 'Crypto' : 'Fiat';
        }
    })
    .filter('extension', function () {
        return function (input) {
            return input.split('.').pop()
        };
    })

    .filter('mapSupportStatus', function () {
        return function (input) {
            return input == '1' ? 'Open' : 'Closed';
        }
    }).filter('capitalize', function () {
        return function (input) {
            return (!!input) ? input.split(' ').map(function (wrd) { return wrd.charAt(0).toUpperCase() + wrd.substr(1).toLowerCase(); }).join(' ') : '';
        }
    })
    .filter('tradeStatusFilter', function () {
        return function (input) {

            var $return = '';
            switch (input) {
                case 'Executed':
                    $return = 'Pending';
                    break;
                case 'Partially Executed':
                    $return = 'Exchanging';
                    break;
                default:
                    $return = ''
            }
            return $return;
        }
    })
    .filter('mapWithdrawStatusAdmin', function () {
        return function (input) {

            var $return = '';
            switch (input) {
                case 0:
                    $return = 'Pending';
                    break;
                case 1:
                    $return = 'Approved';
                    break;
                case 2:
                    $return = 'Not Approved';
                    break;
                default:
                    $return = ''
            }
            return $return;
        }
    }).filter('mapDepositStatusAdmin', function () {
        return function (input) {

            var $return = '';
            switch (input) {
                case 0:
                    $return = 'Pending';
                    break;
                case 1:
                    $return = 'Approved';
                    break;
                case 2:
                    $return = 'Not Approved';
                    break;
                default:
                    $return = ''
            }
            return $return;
        }
    }).filter('emailVerificationStatus', function () {
        return function (input) {
            return input == '1' ? 'Verified' : 'No verified';
        }
    })
    .filter('kycStatusAdmin', function () {
        return function (input) {

            var $return = '';
            switch (input) {
                case 0:
                    $return = 'Incomplete';
                    break;
                case 1:
                    $return = 'Pending';
                    break;
                case 2:
                    $return = 'Verified';
                    break;
                case 3:
                    $return = 'Not Verified';
                    break;
                default:
                    $return = ''
            }
            return $return;
        };
    }).filter('makePositive', function () {
        return function (number) {
            return Math.abs(number);
        }
    }).filter('adminDateFilter', function ($filter) {
        return function (dateString) {
            return $filter('date')(dateString, !sessionStorage.getItem('displayDateFormat') || "dd-MM-yyyy HH:mm a");
        }
    }).filter('KycMasterType', function ($filter) {
        return function (input) {

            var $return = '';
            switch (input) {

                case 1:
                    $return = 'Kyc Tabs';
                    break;
                case 2:
                    $return = 'ID Proof';
                    break;
                case 4:
                    $return = 'Address Proof';
                    break;
                default:
                    $return = ''
            }
            return $return;
        };
    }).filter('statusall', function () {
        return function (input) {

            var $return = '';
            switch (input) {
                case '':
                    $return = 'All';
                    break;
                case 'Executed':
                    $return = 'Pending';
                    break;
                case 'Partially Executed':
                    $return = 'Partially Executed';
                    break;
                default:
                    $return = ''
            }
            return $return;
        }
    })
    .filter('supportIssueFilter', function () {
        return function (input) {

            var $return = '';
            switch (input) {
                case '1':
                    $return = 'Cryptocurrency Deposits';
                    break;
                case '2':
                    $return = 'Cryptocurrency Withdrawals';
                    break;
                case '3':
                    $return = 'USD Deposits';
                    break;
                case '4':
                    $return = 'USD Withdrawals';
                    break;
                case '5':
                    $return = 'Trading';
                    break;
                case '6':
                    $return = 'Account Access/ Security';
                    break;
                case '7':
                    $return = 'Account/ Bank verification';
                    break;
                case '8':
                    $return = 'Google Authenticator 2FA';
                    break;
                case '9':
                    $return = 'Change of Contact Details (email, mobile number)';
                    break;
                default:
                    $return = ''
            }
            return $return;
        }
    }).filter('tradeDetailFilter', function() {
        return function(input) {

            var $return = '';
            switch (input) {
                case 'Executed':
                    $return = 'Open';
                    break;
                case 'Partially Executed':
                    $return = 'Partially Executed';
                    break;
                case 'Not Executed':
                    $return = 'Not Executed';
                    break;
                case 'Fully Executed':
                    $return = 'Fully Executed';
                    break;
                default:
                    $return = ''
            }
            return $return;
        }
    }).filter('orderBookFilter', function() {
        return function(input) {

            var $return = '';
            switch (input) {
                case 'Executed':
                    $return = 'Open';
                    break;
                case 'Partially Executed':
                    $return = 'Partially Executed';
                    break;

                default:
                    $return = ''
            }
            return $return;
        }
    });