App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load books.
    $.getJSON('../books.json', function(data) {
      var booksRow = $('#booksRow');
      var bookTemplate = $('#bookTemplate');

      for (i = 0; i < data.length; i ++) {
        bookTemplate.find('.panel-title').text(data[i].name);
        bookTemplate.find('img').attr('src', data[i].picture);
        bookTemplate.find('.book-ID').text(data[i].ID);
        bookTemplate.find('.book-Type').text(data[i].Type);
        bookTemplate.find('.book-Author').text(data[i].Author);
        bookTemplate.find('.btn-pick').attr('data-id', data[i].id);
        bookTemplate.find('.btn-k').attr('data-id', data[i].id);

        booksRow.append(bookTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    //create our web3 object
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('PickBook.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var PickBookArtifact = data;
      App.contracts.PickBook = TruffleContract(PickBookArtifact);
    
      // Set the provider for our contract
      App.contracts.PickBook.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the picked books.
      return App.markPicked();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-k', App.handleK);
    $(document).on('click', '.btn-pick', App.handlePick);
  },
  
  markPicked: function(pickers, account) {
    
    var pickBookInstance;
    var address1 = web3.eth.accounts[0];
   
    App.contracts.PickBook.deployed().then(function(instance) {
      pickBookInstance = instance;

      return pickBookInstance.getPickers.call();
    }).then(function(pickers) {
      for (i = 0; i < pickers.length; i++) {
        if (pickers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-book').eq(i).find('button1').text('I am picked.').attr('disabled', true);  
        }
        else {
          $('.panel-book').eq(i).find('button1').text('Pick Me.').attr('disabled', false);
        }
        if (pickers[i] !== address1) {
          $('.panel-book').eq(i).find('button2').text('Return Me.').attr('disabled', true).hide();
        }
        else{
          $('.panel-book').eq(i).find('button2').text('Return Me.').attr('disabled', false).show();
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handlePick: function(event) {

    event.preventDefault();

    var bookId = parseInt($(event.target).data('id'));
    var pickBookInstance;
    //alert(bookId)

    //We use web3 to get the user's accounts.
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    //we select the first account
    var account = accounts[0];

    App.contracts.PickBook.deployed().then(function(instance) {
    pickBookInstance = instance;

    // Execute pick as a transaction by sending account
    return pickBookInstance.pick(bookId, {from: account});
  }).then(function(result) {
    return App.markPicked();
  }).catch(function(err) {
    console.log(err.message);
  });
});
  },

  handleK: function(event) {

    event.preventDefault();

    var bookId = parseInt($(event.target).data('id'));
    var kBookInstance;
    //alert(bookId)
    //We use web3 to get the user's accounts.
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    //we select the first account
    var account = accounts[0];

    App.contracts.PickBook.deployed().then(function(instance) {
    kBookInstance = instance;
    // alert(kBookInstance)
    
    // Execute pick as a transaction by sending account
    return kBookInstance.k(bookId, {from: account});
  }).then(function(result) {
    return App.markPicked();
  }).catch(function(err) {
    console.log(err.message);
  });
});
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
