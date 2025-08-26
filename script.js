class EventScheduler {
    constructor() {
        this.events = this.loadEvents();
        this.selectedDrinks = this.loadDrinksSelection();
        this.drinks = [
            { id: 1, name: "POKER", price: 21000, category: "beer", image: "images/POKER.jpg", description: "VALOR X6" },
            { id: 2, name: "AGUILA", price: 21000, category: "beer", image: "images/GUILA.jpeg", description: "VALOR X6" },
            { id: 3, name: "ANDINA", price: 16000, category: "beer", image: "images/ANDINA.jpeg", description: "VALOR X6" },
            { id: 4, name: "CORONA", price: 20000, category: "beer", image: "images/CORONA.jpeg", description: "VALOR X6" },
            { id: 5, name: "BUDWEISER", price: 18000, category: "beer", image: "images/BUDWEISER.jpeg", description: "VALOR X6" },
            { id: 6, name: "CLUB COLOMBIA", price: 25000, category: "beer", image: "images/CLUBCOLOMBIA.jpeg", description: "VALOR X6" },
            { id: 7, name: "RON", price: 60000, category: "spirits", image: "images/RON.jpeg", description: "VALOR POR LITRO" },
            { id: 8, name: "VODKA", price: 75000, category: "spirits", image: "images/VODKA.jpeg", description: "VALOR POR LITRO" },
            { id: 9, name: "AGUARDIENTE NECTAR", price: 45000, category: "spirits", image: "images/AGUARDIENTE.jpeg", description: "VALOR POR LITRO" },
            { id: 10, name: "ANTIOQUEÑO", price: 65000, category: "spirits", image: "images/ANTIOQUEÑO.jpeg", description: "VALOR POR LITRO" }
        ];
        this.initializeEventListeners();
        this.renderEvents();
        this.renderCalendar();
        this.renderDrinks();
        this.updateStats();
    }

    initializeEventListeners() {
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEvent();
        });
    }

    addEvent() {
        const name = document.getElementById('eventName').value.trim();
        const type = document.getElementById('eventType').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value.trim();

        if (!name || !type || !date) {
            alert('Por favor completa todos los campos obligatorios.');
            return;
        }

        const event = {
            id: Date.now(),
            name,
            type,
            date,
            time,
            description,
            created: new Date().toISOString()
        };

        this.events.push(event);
        this.saveEvents();
        this.renderEvents();
        this.renderCalendar();
        this.updateStats();
        this.clearForm();

        this.showMessage('¡Evento agregado exitosamente!', 'success');
    }

    deleteEvent(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            this.events = this.events.filter(event => event.id !== id);
            this.saveEvents();
            this.renderEvents();
            this.renderCalendar();
            this.updateStats();
            this.showMessage('Evento eliminado', 'info');
        }
    }

    renderDrinks() {
        const drinksGrid = document.getElementById('drinksGrid');
        
        const drinksHTML = this.drinks.map(drink => {
            const isSelected = this.selectedDrinks.includes(drink.id);
            const imageSrc = drink.image || 'https://via.placeholder.com/80x80?text=No+Image';
            return `
                <div class="drink-card ${isSelected ? 'selected' : ''}" onclick="scheduler.toggleDrink(${drink.id})">
                    <img src="${imageSrc}" alt="${drink.name}" class="drink-image">
                    <div class="drink-info">
                        <h4 class="drink-name">${drink.name}</h4>
                        <p class="drink-description">${drink.description}</p>
                        <div class="drink-details">
                            <span class="drink-price">$${drink.price.toFixed(2)}</span>
                            <span class="drink-category">${this.getCategoryName(drink.category)}</span>
                        </div>
                    </div>
                    <div class="drink-select-indicator">
                        ${isSelected ? '✓' : '+'}
                    </div>
                </div>
            `;
        }).join('');

        drinksGrid.innerHTML = drinksHTML;
        this.updateSelectedDrinksList();
    }

    toggleDrink(drinkId) {
        const index = this.selectedDrinks.indexOf(drinkId);
        if (index > -1) {
            this.selectedDrinks.splice(index, 1);
        } else {
            this.selectedDrinks.push(drinkId);
        }
        this.saveDrinksSelection();
        this.renderDrinks();
        this.showMessage(
            index > -1 ? 'Bebida removida de la selección' : 'Bebida agregada a la selección', 
            'info'
        );
    }

    clearDrinksSelection() {
        if (this.selectedDrinks.length === 0) {
            this.showMessage('No hay bebidas seleccionadas', 'info');
            return;
        }
        
        if (confirm('¿Estás seguro de que quieres limpiar toda la selección?')) {
            this.selectedDrinks = [];
            this.saveDrinksSelection();
            this.renderDrinks();
            this.showMessage('Selección de bebidas limpiada', 'info');
        }
    }

    updateSelectedDrinksList() {
        const selectedList = document.getElementById('selectedDrinksList');
        
        if (this.selectedDrinks.length === 0) {
            selectedList.innerHTML = '<p class="no-selection">No has seleccionado bebidas aún</p>';
            return;
        }

        const selectedDrinksData = this.selectedDrinks.map(id => 
            this.drinks.find(drink => drink.id === id)
        );

        const total = selectedDrinksData.reduce((sum, drink) => sum + drink.price, 0);

        const selectedHTML = selectedDrinksData.map(drink => `
            <div class="selected-drink-item">
                <img src="${drink.image}" alt="${drink.name}" class="selected-drink-image">
                <span class="selected-drink-name">${drink.name}</span>
                <span class="selected-drink-price">$${drink.price.toFixed(2)}</span>
                <button class="remove-drink-btn" onclick="scheduler.toggleDrink(${drink.id})">×</button>
            </div>
        `).join('');

        selectedList.innerHTML = `
            ${selectedHTML}
            <div class="drinks-total">
                <strong>Total: $${total.toFixed(2)}</strong>
            </div>
        `;
    }

    getCategoryName(category) {
        const categories = {
            'beer': 'Cerveza',
            'spirits': 'Licores',
            'cocktail': 'Cóctel',
            'wine': 'Vino',
            'soft': 'Sin Alcohol',
            'hot': 'Caliente'
        };
        return categories[category] || category;
    }

    renderEvents() {
        const eventsList = document.getElementById('eventsList');
        
        if (this.events.length === 0) {
            eventsList.innerHTML = '<div class="no-events">No hay eventos programados. ¡Agrega tu primer evento!</div>';
            return;
        }

        const sortedEvents = this.events.sort((a, b) => new Date(a.date) - new Date(b.date));

        const eventsHTML = sortedEvents.map(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const eventDay = new Date(event.date);
            eventDay.setHours(0, 0, 0, 0);
            const isUpcoming = eventDay >= today;
            const daysUntil = Math.ceil((eventDay - today) / (1000 * 60 * 60 * 24));

            return `
                <div class="event-card ${event.type} ${!isUpcoming ? 'past-event' : ''}">
                    <div class="event-header">
                        <div class="event-title">${event.name}</div>
                        <div class="event-type ${event.type}">${event.type === 'cumpleanos' ? '🎂 Cumpleaños' : '🎪 Evento'}</div>
                    </div>
                    <div class="event-date">${formattedDate}</div>
                    ${event.time ? `<div class="event-details">🕐 ${event.time}</div>` : ''}
                    ${event.description ? `<div class="event-details">${event.description}</div>` : ''}
                    ${isUpcoming && daysUntil >= 0 ? `<div class="event-details">⏰ ${daysUntil === 0 ? '¡Hoy!' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`}</div>` : ''}
                    <button class="delete-btn" onclick="scheduler.deleteEvent(${event.id})">🗑️ Eliminar</button>
                </div>
            `;
        }).join('');

        eventsList.innerHTML = eventsHTML;
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        let calendarHTML = '<div class="calendar-month-year">' + today.toLocaleString('es-ES', { month: 'long', year: 'numeric' }) + '</div>';

        daysOfWeek.forEach(day => {
            calendarHTML += `<div class="calendar-header">${day}</div>`;
        });

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="calendar-day"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(currentYear, currentMonth, day);
            const dateString = dayDate.toISOString().split('T')[0];
            
            const dayEvents = this.events.filter(event => {
                const eventDateObj = new Date(event.date);
                return eventDateObj.getMonth() === currentMonth && eventDateObj.getDate() === day;
            });

            const hasEvents = dayEvents.length > 0;
            const hasBirthdays = dayEvents.some(event => event.type === 'cumpleanos');
            const isToday = dayDate.getDate() === today.getDate() && dayDate.getMonth() === today.getMonth();

            let dayClass = 'calendar-day';
            if (hasEvents) dayClass += ' has-event';
            if (hasBirthdays) dayClass += ' has-birthday';
            if (isToday) dayClass += ' is-today';

            let indicators = '';
            dayEvents.forEach(event => {
                indicators += `<div class="event-indicator ${event.type}"></div>`;
            });

            calendarHTML += `
                <div class="${dayClass}" title="${dayEvents.map(e => e.name).join(', ')}">
                    ${day}
                    ${indicators}
                </div>
            `;
        }
        calendar.innerHTML = calendarHTML;
    }

    updateStats() {
        const totalEvents = this.events.length;
        const totalBirthdays = this.events.filter(event => event.type === 'cumpleanos').length;

        document.getElementById('totalEvents').textContent = totalEvents;
        document.getElementById('totalBirthdays').textContent = totalBirthdays;
    }

    clearForm() {
        document.getElementById('eventForm').reset();
    }

    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }

    loadEvents() {
        const storedEvents = localStorage.getItem('events');
        return storedEvents ? JSON.parse(storedEvents) : [];
    }
    
    saveDrinksSelection() {
        localStorage.setItem('selectedDrinks', JSON.stringify(this.selectedDrinks));
    }

    loadDrinksSelection() {
        const storedSelection = localStorage.getItem('selectedDrinks');
        return storedSelection ? JSON.parse(storedSelection) : [];
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#4299e1'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Initialize the scheduler when the page loads
let scheduler;
document.addEventListener('DOMContentLoaded', () => {
    scheduler = new EventScheduler();
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    .past-event {
        opacity: 0.6;
    }
`;
document.head.appendChild(style);