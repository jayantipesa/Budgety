//var i = new obj : meaning is new empty object is created and function 'obj' is called and the 'this' keyword of the obj funtion now points to the new empty object created,so values are given to properties of the new empty object.

var budgetController = (function() {

    //we create two function constructors of expense and income, each new expense or income will be an object of this type. 

    //we added a seperate method to calculate expense percentage of every expense object
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0)
            this.percentage = Math.round((this.value / totalIncome) * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems : {
            exp : [], // stores all objects of expenses
            inc : []  // stores all objects of incomes
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }

    return {
        addItem : function(type, des, val) {
            var newItem, ID;

            // [1,2,4,6] coz 3 and 5 are deleted, then nextID will be 6+1, ie we have to access the last id and add 1 to it to find new unique id
            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            //create new object based on 'inc' or 'exp'
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // we can use square brackets below to access the arrays present in allItems directly.
            data.allItems[type].push(newItem);
            
            //return newly created expense or income so other modules can use it.
            return newItem;
        },

        calculateBudget : function() {
            //calculate total income and expense
            calculateTotal('inc');
            calculateTotal('exp');
            
            //calculate budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate percentage of income spent
            if(data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) *100);
            else
                data.percentage = -1;
        },

        calculatePercentage : function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },

        //we use map method her and not foreach because getpercentage method written above returns a value which we want to store
        getPercentages : function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            })
            return allPerc;
        },

        getBudget : function() {
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },

        //id obtained by inc-0, inc-1 cannot be taken index of inc array because inc-1 for sure can't be at index 1 only
        //so instead we will loop over all the elements in the array
        //map method receives a callback function with three arguements: current, index,whole array just like foreach method
        //the difference is map returns a brand new array foreach doesn't return anything
        deleteItem : function(type, id) {
            var ids, index;

            //for eg inc = [1,2,4,6,8] 3,5,7 are deleted

            ids = data.allItems[type].map(function(current) {
                return current.id;
                //we get [1,2,4,6,8] we get array contaiing all ids
            });

            //now we find the index of id we need and delete it
            index = ids.indexOf(id);
            if(index !== -1)
                data.allItems[type].splice(index, 1);
        },
        data:data
    }

    
    
}) ();


var UIController = (function() {

    var DOMStrings = {
        inputType : '.add_type',
        inputDescription : '.add_description',
        inputValue : '.add_value',
        addBtn : '.add_btn',
        incomeContainer : '.income_list',
        expenseContainer : '.expenses_list',
        budgteValue : '.budget_value',
        incomeValue : '.budget_income-value',
        expenseValue : '.budget_expenses-value',
        percentageValue : '.budget_expenses-percentage',
        container : '.container',
        itemPercentage : '.item_percentage',
        currentDate : '.budget_title-month',
        fields : '.field'
    };

    //this function will be called everytime a number is to outputted and format it accordingly
    var formatNumber = function(number, type) {
        /* 
            rules: 1. + or - sign depending on type
            2. only upto 2 digits in decimal
            3. format numbers with comma            
        */

        //(2.4567).toFixed(2) = "2.46" toFixed is method of number type it returns string

        var num, numsplit, int, dec;
        num = Math.abs(number);
        num = num.toFixed(2);
        numsplit = num.split('.');
        int = numsplit[0];

        //comma separating numbers 
        if(int.length > 3) {
            //substr will return the part of the string we want. first arg : index, second arg: length
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3);
        }
        dec = numsplit[1];

        return (type === 'exp' ? '-' :'+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length ; i++)
        {
            callback(list[i], i);
        }
    };


    return {
        getInput: function() {

            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
            
        },

        addListItem : function(obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text

            if(type ==='inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
                
            else if(type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

                }
            
            // replace the placeholder text with actual text
            //rplace is a method of strings so we use it to replace actual text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //insert this html into DOM
            //beforeend because new entries will be appended at the end of exisiting list
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem : function(selectorId) {
            var child = document.getElementById(selectorId);
            child.parentNode.removeChild(child);

        },

        clearfields : function() {
            var fields, fieldsArr;

            //queryselectorAll returns a list.
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            
            //slice returns a copy of array, here we pass it a list and trick it to return an array
            
            //Array is the function constructor for all arrays so in tis prototype we will find slice method. we use call function to pass fields variable as the this variable of slice.
            fieldsArr = Array.prototype.slice.call(fields)

            //now we can loop over the array to clear the fields
            fieldsArr.forEach(element => {
                element.value = "";
            });

            fieldsArr[0].focus(); //give control back to description field
        },

        displayBudget : function(budgetObj) {
            var type;
            budgetObj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgteValue).textContent = formatNumber(budgetObj.budget, type);
            document.querySelector(DOMStrings.incomeValue).textContent = formatNumber(budgetObj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseValue).textContent = formatNumber(budgetObj.totalExp, 'exp');
            
            if(budgetObj.percentage > 0)
                document.querySelector(DOMStrings.percentageValue).textContent = budgetObj.percentage + '%';
            else
                document.querySelector(DOMStrings.percentageValue).textContent = '--';
        },

        displayPercentages : function(percentages) {
            //it returns a nodelist and nodelist doesn't have foreach method , we can convert it into an array first by slice method but we instead make our own foreach method
            var percList = document.querySelectorAll(DOMStrings.itemPercentage); 
            
            nodeListForEach(percList, function(current, index){
                //logic to be performed on each list item to be written here
                if(percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '--';
            });
        },

        displayMonth : function() {
            var now, month;
            now = new Date();

            //toLocaleString method converts Date obj into string takes two parameters first is locale which is language format and next is an object in which you set properties of month,year etc
            month = now.toLocaleString('default' , { month:'long', year:'numeric' });
            document.querySelector(DOMStrings.currentDate).textContent = month;

        },

        changedType : function() {
            var fields = document.querySelectorAll(DOMStrings.fields);
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.addBtn).classList.toggle('red');
        },

        getDOMStrings : function() {
            return DOMStrings;
        }
    };

}) ();


var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);

        //global event listener, not specific to certain button. 'which' keyword used by older browsers
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13)
                ctrlAddItem();
        });

        //in event listeners, the callback function accepts an event object which is used below where function is written
        //event bubbling : we setup event listener on the parent node then later find the target element
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function() {
        //calculate budget
        budgetCtrl.calculateBudget();
        
        //return budget
        var budget = budgetCtrl.getBudget();

        //display budget on UI
        UICtrl.displayBudget(budget);
    }


    //percentage of each expense will be updated everytime a item is added or deleted, so we make a seperate function for it and call in additem and deleteitem
    var updatePercentage = function() {
        //calculate percentages
        budgetCtrl.calculatePercentage();
        //read percentage from budegetController
        //percentages vary with total income and not the budget
        var percentages = budgetCtrl.getPercentages();
        
        //update percentage on ui
        UICtrl.displayPercentages(percentages);
    }

    
    var ctrlAddItem = function() {

        var input, newItem;
        //things to do on clicking add btn
        //take input from UI input
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //add item to budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //adding newitem to UI
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearfields();

            //calculate and update budget
            updateBudget();

            //update expense percentages
            updatePercentage();
        
        }
    }

    //target element is the one which actually triggered the event
    //parentNode used to traverse from the target element to the element that we want  where we obtain the unique id to act on.
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // delete from data structure
            budgetCtrl.deleteItem(type, ID);
            //delete from UI
            UICtrl.deleteListItem(itemID);
            //update and show budget
            updateBudget();
            //update expense percentages
            updatePercentage();
        }
    };

    return {
        init : function() {
            console.log('App started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListeners();
        }
    };
    

}) (budgetController, UIController);

controller.init();


