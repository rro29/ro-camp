(() => {
    const alerts = document.querySelectorAll('.alert.alert-dismissible');

    alerts.forEach(alert => {
        const currentAlert = new bootstrap.Alert(alert)
        setTimeout(() => {
            currentAlert.close();
        }, 3000);
    });
})()