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

    quint32 getPosX() const;
    void setPosX(const quint32 &posX_);

    quint32 getPosY() const;
    void setPosY(const quint32 &posY_);

    quint32 getBombLimit() const;
    void setBombLimit(const quint32 &bombLimit_);

    quint32 getPlacedBombs() const;
    void setPlacedBombs(const quint32 &placedBombs_);

    bool getPushBonus() const;
    void setPushBonus(bool pushBonus_);

signals:
    /**
     * @brief disconnected: signals that player's socket disconnected
     */
    void disconnected();

    void moveRequest(quint32 requestId_, quint32 lastReviewedRequestId_, quint32 x_, quint32 y_);
    void bombRequest(quint32 requestId_, quint32 lastReviewedRequestId_);

public slots:

private:
    QWebSocket *m_socket;
    const QString m_username;
    quint32 m_posX {0};
    quint32 m_posY {0};
    quint32 m_bombLimit {0};
    quint32 m_placedBombs {0};
    bool m_pushBonus {false};

private slots:
    void onReceivedTextMessage(const QString &message_);
};

#endif // PLAYER_H
