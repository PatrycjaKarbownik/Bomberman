#ifndef BOMB_H
#define BOMB_H

#include <player.h>

#include <QObject>
#include <QTimer>

class Bomb : public QObject
{
    Q_OBJECT
public:
    explicit Bomb(qint32 id_, Player *owner_, const qint32 explosionTimeout, QObject *parent = nullptr);

    void stopCountdown();

    double posX() const;
    void setPosX(double posX);

    double posY() const;
    void setPosY(double posY);

    qint32 id() const;

    Player *owner() const;

    qint32 range() const;
    void setRange(const qint32 &range);

signals:
    void exploded(Bomb *explodedBomb);

public slots:

private:
    QTimer m_explosionTimer;
    Player *m_owner;
    double m_posX;
    double m_posY;
    const qint32 m_id;
    qint32 m_range {2};

private slots:
    void onExplosionTimeout();
};

#endif // BOMB_H
