#include <QCommandLineParser>
#include <QCoreApplication>
#include <QFile>

#include "gamehostshub.h"

// redirecting qDebug() and other to file
void customMessageHandler(QtMsgType type, const QMessageLogContext &context, const QString &msg)
{
   Q_UNUSED(context)

   QString dt = QDateTime::currentDateTime().toString("dd/MM/yyyy hh:mm:ss");
   QString txt = QString("[%1] ").arg(dt);

   switch (type)
   {
        case QtDebugMsg:
            txt += QString("{Debug} \t\t %1").arg(msg);
            break;
        case QtInfoMsg:
            txt += QString("{Info} \t\t %1").arg(msg);
            break;
        case QtWarningMsg:
            txt += QString("{Warning} \t %1").arg(msg);
            break;
        case QtCriticalMsg:
            txt += QString("{Critical} \t %1").arg(msg);
            break;
        case QtFatalMsg:
            txt += QString("{Fatal} \t\t %1").arg(msg);
            abort();
   }

   QFile outFile("hostmanagerserver.log");
   outFile.open(QIODevice::WriteOnly | QIODevice::Append);

   QTextStream textStream(&outFile);
   textStream << txt << endl;
}

// TODO Remove parsing arguments from main to shorten it
int main(int argc, char *argv[])
{
    qInstallMessageHandler(customMessageHandler);
    QCoreApplication a(argc, argv);

    QCommandLineParser parser;
    parser.setApplicationDescription("Host manager for bomberman servers");
    parser.addPositionalArgument("OverseerPort", "Port for communicating with overseer");
    parser.addPositionalArgument("MaxGames", "Maximum number of games application is allowed to start");

    parser.process(a);

    const QStringList args = parser.positionalArguments();

    if (args.size() < 2) {
        qCritical() << "[Parsing arguments] Not all positional arguments were provided";
        return 1;
    }

    bool parsingResult;

    auto overseerPort = static_cast<quint16>(args.at(0).toShort(&parsingResult));
    if (!parsingResult) {
        qCritical() << "[Parsing arguments] Port is not a number!";
        return 2;
    }

    auto maxGames = static_cast<quint32>(args.at(1).toInt(&parsingResult));
    if (!parsingResult) {
        qCritical() << "[Parsing arguments] MaxGames is not a number!";
        return 3;
    }

    // Initialize singleton at the start
    OverseerCommunication *overseerCommunication = new OverseerCommunication(overseerPort, &a);
    GameHostsHub gameHostsHub(overseerCommunication, maxGames, &a);

    if (overseerCommunication->isCommunicationWorking()) {
        qCritical() << "[Overseer communication] Communication could not start";
        return 5;
    }

    return a.exec();
}
