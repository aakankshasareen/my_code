app.constant('TRANSACTION_TYPE', [
   {'name': 'Buy', 'value': 'Buy', 'label' : 'Buy'},
    {'name': 'Sell', 'value': 'Sell', 'label': 'Sell'}
])
        .constant('TRADE_TYPE', [
            {'name': 'Limit', 'value': 'Limit', 'label': 'Limit'},
            {'name': 'Market', 'value': 'Market', 'label': 'Market'}
        ])
        .constant('STATUS_TYPE', [
            {'name': 'Fully Executed', 'value': 'Fully Executed', 'label': 'Fully Executed'},
            {'name': 'Partially Executed', 'value': 'Partially Executed', 'label': 'Partially Executed'},
            {'name': 'Not Executed', 'value': 'Not Executed', 'label': 'Not Executed'}
        ])
        .constant('KYC_STATUS', [
            {name: 'Incomplete', label: 'Incomplete', value: 0},
            {name: 'Pending', label: 'Pending', value: 1},
            {name: 'Verified', label: 'Verified', value: 2},
            {name: 'Not Verified', label: 'Not Verified', value: 3}
        ])
        .constant('BANK_STATUS', [
            // {name: 'Incomplete', label: 'Incomplete', value: 0},
            // {name: 'Pending', label: 'Pending', value: 1},
            {name: 'Verified', label: 'Verified', value: 2},
            {name: 'Not Verified', label: 'Not Verified', value: 3}
        ])
        .constant('KYC_MASTER_TYPE', [
            {name: 'Kyc Tabs', label: 'Kyc Tabs', id: 1, value: 1},
            {name: 'ID Proof', label: 'ID Proof', id: 2, value: 2},
            {name: 'Address Proof', label: 'Address Proof', id: 4, value: 4}
        ])
        .constant('STATUS', [
            {name: 'Active', label: 'Active', value: 1, id: 1},
            {name: 'Inactive', label: 'Inactive', value: 0, id: 0},
        ])
        .constant('CURRENCY_TYPE', [
            {name: 'Crypto ', label: 'Crypto ', value: 1, id: 1},
            {name: 'Fiat ', label: 'Fiat', value: 0, id: 0},
        ])
        .constant('ID_TYPE', [// default value when country doesnt have any ID proof type
            {"id": 11, "name": "Identity Card", "status": 1, "icon_name": null}
        ])
        .constant('ADDRESS_TYPE', [// default value when country doesnt have any address proof type
            {"id": 10, "name": "Utility Bill", "status": 1, "icon_name": null}
        ])
        .constant('IMAGE_TYPE', ['png', 'jpg', 'jpeg'])
        .constant('ORDER_STATUS',[
          {name: 'Pending', value: 'Executed', label: 'Pending' },
          {name: 'Partially Executed', value: 'Partially Executed', label: 'Exchanging'}
        ]).constant('WITHDRAW_DEPOSIT_STATUS', [
          {name: 'Pending', value: 0, label: 'Pending'},
          {name: 'Success', value: 1, label: 'Approved'},
          {name: 'Failed', value: 2, label: 'Not Approved'},

        ]).constant('WITHDRAW_DEPOSIT', [
          {name: 'Deposit', value: 'Deposit', label: 'Deposit'},
          {name: 'Withdraw', value: 'Withdraw', label: 'Withdrawal'}
        ]).constant('WITHDRAW_DEPOSIT_STATUS_INR', [
          {name: 'Pending', value: 0, label: 'Pending'},
          {name: 'Success', value: 1, label: 'Approved'},
          {name: 'Failed', value: 2, label: 'Not Approved'},
        ])
        
        .constant('SUPPORT_TYPE', [
            {name: 'Cryptocurrency Deposits', label: 'Cryptocurrency Deposits', id: 1, value: 1},
            {name: 'Cryptocurrency Withdrawals', label: 'Cryptocurrency Withdrawals', id: 2, value: 2},
            {name: 'USD Deposits', label: 'USD Deposits', id: 3, value: 3},
            {name: 'USD Withdrawals', label: 'USD Withdrawals', id: 4, value: 4},
            {name: 'Trading', label: 'Trading', id: 5, value: 5},
            {name: 'Account Access/ Security', label: 'Account Access/ Security', id: 6, value: 6},
            {name: 'Account/ Bank verification', label: 'Account/ Bank verification', id: 7, value: 7},
            {name: 'Google Authenticator 2FA', label: 'Google Authenticator 2FA', id: 8, value: 8},
            {name: 'Change of Contact Details (email, mobile number)', label: 'Change of Contact Details (email, mobile number)', id: 9, value: 9},  
        ])
         .constant('Email_Verify', [
            {name: 'Not Verify', label: 'Not Verify', value: 0},
            {name: 'Verify', label: 'Verify', value: 1},
           
        ])
        ;
