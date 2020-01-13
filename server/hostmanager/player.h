#ifndef PLAYER_H
#define PLAYER_H

#include <QObject>
#include <QWebSocket>

class Player : public QObject
{
    Q_OBJECT
public:
    explicit Player(QWebSocket *socket_, const QString& username_, QObject *parent = nullptr);
    ~Player();

    QString getUsername() const;
    QWebSocket *getSocket() const;

signals:
    void disconnected();

public slots:

private:
    QWebSocket *m_socket;
    const QString m_username;
};

#endif // PLAYER_H
