#ifndef PLAYER_H
#define PLAYER_H

#include <QObject>
#include <QWebSocket>

/**
 * @brief The Player class
 *
 * Whole purpose of class is to handle player's socket: sending informations to player about a game
 * and emiting signals whenever player for example presses a button
 */
class Player : public QObject
{
    Q_OBJECT
public:
    explicit Player(QWebSocket *socket_, const QString& username_, QObject *parent = nullptr);
    ~Player();

    /**
     * @brief getUsername
     * @return QString with username
     */
    QString getUsername() const;

    /**
     * @brief getSocket
     * @return Raw pointer to player's websocket
     */
    QWebSocket *getSocket() const;

signals:
    /**
     * @brief disconnected: signals that player's socket disconnected
     */
    void disconnected();

public slots:

private:
    QWebSocket *m_socket;
    const QString m_username;
};

#endif // PLAYER_H
