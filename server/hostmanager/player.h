#ifndef PLAYER_H
#define PLAYER_H

#include <QObject>
#include <QWebSocket>

struct Coordinates {
    qint32 x {0};
    qint32 y {0};
};

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

    double getPosX() const;
    void setPosX(const double &posX_);

    double getPosY() const;
    void setPosY(const double &posY_);

    quint32 getBombLimit() const;
    void setBombLimit(const quint32 &bombLimit_);

    quint32 getPlacedBombs() const;
    void setPlacedBombs(const quint32 &placedBombs_);

    bool hasPushBonus() const;
    void setPushBonus(bool pushBonus_);

    quint32 getInGameId() const;
    void setInGameId(const quint32 &id);

    qint32 getLastRejectedRequestId() const;
    void setLastRejectedRequestId(const qint32 &lastRejectedRequestId);

    bool isAlive() const;
    void setAlive(bool alive);

    quint32 getSpeed() const;
    void setSpeed(const quint32 &speed);

    std::list<Coordinates> getBombsUnderPlayer() const;
    bool areCoordsOfBombUnderPlayer(const qint32 xPos_, const qint32 yPos_);
    void addBombUnderPlayer(const qint32 bombXPos_, const qint32 bombYPos_);
    void removeBombUnderPlayer(const qint32 bombXPos_, const qint32 bombYPos_);

    qint32 getBombRange() const;
    void setBombRange(const qint32 &bombRange);

    quint32 getPlace() const;
    void setPlace(const quint32 &place);

signals:
    /**
     * @brief disconnected: signals that player's socket disconnected
     */
    void disconnected();

    void moveRequest(Player* player_, quint32 requestId_, quint32 lastReviewedRequestId_,
                     double x_, double y_);
    void bombRequest(Player* player_, quint32 requestId_, quint32 lastReviewedRequestId_,
                     double x_, double y_);

public slots:

private:
    std::list<Coordinates> m_bombsUnderPlayer;
    QWebSocket *m_socket;
    const QString m_username;
    double m_posX {0};
    double m_posY {0};
    quint32 m_bombLimit {0};
    quint32 m_placedBombs {0};
    quint32 m_inGameId {0};
    qint32 m_lastRejectedRequestId {-1};
    qint32 m_bombRange {2};
    quint32 m_speed {2};
    quint32 m_place {5};
    bool m_pushBonus {false};
    bool m_alive {true};
    bool m_onBomb {false};

private slots:
    void onReceivedTextMessage(const QString &message_);
};

#endif // PLAYER_H
