const modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const atention = {
    open() {
        document.querySelector('.atention-overlay').classList.add('active');
    },
    close() {
        document.querySelector('.atention-overlay').classList.remove('active');
    }
}


const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {

    all: Storage.get(),


    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },
    removeAll() {

      while(Transaction.all.length>0){
          Transaction.remove(Transaction.all);
      }
      if(Transaction.all.length==0){
          atention.close();
      }

    },

    incomes() {

        let income = 0;

        Transaction.all.forEach(transactions => {

            if (transactions.amount > 0) {
                income += transactions.amount;

            }

        });


        return income;
    },
    exepenses() {

        let expenses = 0;
        Transaction.all.forEach(transactions => {

            if (transactions.amount < 0) {
                expenses += transactions.amount;

            }

        });


        return expenses;
    },

    total() {
        return Transaction.incomes() + Transaction.exepenses();

    }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transactions, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transactions, index) {
        let CSSClass = transactions.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transactions.amount);

        const html = `
       <td class="descripition">${transactions.description}</td>
       <td class="${CSSClass}">${amount}</td>
       <td class="date">${transactions.date}</td>
       <td > <img onclick="Transaction.remove(${index})" id="removeTransaction" src="assets/imagens/minus.svg" alt="remover transação"><a></td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.exepenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}



const Utils = {
    formatDate(date) {
        const splittedDate = date.split("-");

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatAmount(value) {
        value = Number(value) * 100;

        return value;
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        });
        return signal + value;
    },



}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),


    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return {
            description,
            amount,
            date
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        }

    },
    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

         try {

            Form.validateFields();

            const transactions = Form.formatValues();

            Transaction.add(transactions);

            Form.clearFields();

            modal.close();

            App.reload();

       } catch (error) {
             Errors.activeError();
             setTimeout(Errors.desableError, 3000);

         }



    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);
 
        DOM.updateBalance();
   
        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init()
    }
}

 

const Errors = {
    activeError() {
        document.querySelector('.error').classList.remove('active');
    },
    desableError() {

        document.querySelector('.error').classList.add('active')
    }
}

App.init();

